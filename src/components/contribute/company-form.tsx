import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Company } from "@/types/company";
import type { Category, Contact } from "@/data/companies/schema";

// Form-specific schema (without $schema field)
const ContactFormSchema = v.object({
	product: v.pipe(v.string(), v.minLength(1, "Product/role name is required")),
	handles: v.pipe(
		v.array(v.string()),
		v.minLength(1, "At least one handle is required"),
	),
	email: v.optional(v.string()),
	discord: v.optional(v.string()),
});

const CategoryFormSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Category name is required")),
	contacts: v.pipe(
		v.array(ContactFormSchema),
		v.minLength(1, "At least one contact is required"),
	),
});

const CompanyFormSchema = v.object({
	id: v.pipe(
		v.string(),
		v.minLength(1, "Company ID is required"),
		v.regex(
			/^[a-z0-9-]+$/,
			"ID must be lowercase with only letters, numbers, and hyphens",
		),
	),
	name: v.pipe(v.string(), v.minLength(1, "Company name is required")),
	description: v.pipe(v.string(), v.minLength(1, "Description is required")),
	logoType: v.pipe(v.string(), v.minLength(1, "Logo type is required")),
	website: v.optional(v.string()),
	docs: v.optional(v.string()),
	github: v.optional(v.string()),
	discord: v.optional(v.string()),
	categories: v.pipe(
		v.array(CategoryFormSchema),
		v.minLength(1, "At least one category is required"),
	),
});

type CompanyFormData = v.InferOutput<typeof CompanyFormSchema>;

interface CompanyFormProps {
	initialData?: Company;
	onSubmit: (data: Company) => void;
	isSubmitting?: boolean;
	isEdit?: boolean;
}

export function CompanyForm({
	initialData,
	onSubmit,
	isSubmitting = false,
	isEdit = false,
}: CompanyFormProps) {
	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CompanyFormData>({
		resolver: valibotResolver(CompanyFormSchema),
		defaultValues: initialData || {
			id: "",
			name: "",
			description: "",
			logoType: "",
			website: "",
			docs: "",
			github: "",
			discord: "",
			categories: [
				{
					name: "",
					contacts: [
						{
							product: "",
							handles: [""],
							email: "",
							discord: "",
						},
					],
				},
			],
		},
	});

	const {
		fields: categoryFields,
		append: appendCategory,
		remove: removeCategory,
	} = useFieldArray({
		control,
		name: "categories",
	});

	const companyName = watch("name");

	// Auto-generate ID from name
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		if (!isEdit) {
			const id = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");
			setValue("id", id);
			setValue("logoType", id);
		}
	};

	const handleFormSubmit = (data: CompanyFormData) => {
		// Clean up empty optional fields
		const cleanedData: Company = {
			...data,
			website: data.website || undefined,
			docs: data.docs || undefined,
			github: data.github || undefined,
			discord: data.discord || undefined,
			categories: data.categories.map((cat) => ({
				...cat,
				contacts: cat.contacts.map((contact) => ({
					...contact,
					handles: contact.handles.filter((h) => h.startsWith("@")),
					email: contact.email || undefined,
					discord: contact.discord || undefined,
				})),
			})),
		};

		onSubmit(cleanedData);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
			{/* Basic Information */}
			<div className="space-y-6">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
					Basic Information
				</h3>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="name">Company Name *</Label>
						<Input
							id="name"
							placeholder="Acme Inc"
							{...register("name", {
								onChange: handleNameChange,
							})}
						/>
						{errors.name && (
							<p className="text-sm text-red-600">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="id">Company ID *</Label>
						<Input
							id="id"
							placeholder="acme-inc"
							disabled={isEdit}
							{...register("id")}
						/>
						{errors.id && (
							<p className="text-sm text-red-600">{errors.id.message}</p>
						)}
						<p className="text-xs text-zinc-500">
							Lowercase, letters, numbers, and hyphens only
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description *</Label>
					<Textarea
						id="description"
						placeholder="Brief description of what your company does"
						{...register("description")}
					/>
					{errors.description && (
						<p className="text-sm text-red-600">{errors.description.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="logoType">Logo Type *</Label>
					<Input
						id="logoType"
						placeholder="acme-inc"
						{...register("logoType")}
					/>
					{errors.logoType && (
						<p className="text-sm text-red-600">{errors.logoType.message}</p>
					)}
					<p className="text-xs text-zinc-500">
						This should match your company ID
					</p>
				</div>
			</div>

			{/* Links */}
			<div className="space-y-6">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
					Links (Optional)
				</h3>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="website">Website</Label>
						<Input
							id="website"
							type="url"
							placeholder="https://acme.com"
							{...register("website")}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="docs">Documentation</Label>
						<Input
							id="docs"
							type="url"
							placeholder="https://docs.acme.com"
							{...register("docs")}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="github">GitHub</Label>
						<Input
							id="github"
							type="url"
							placeholder="https://github.com/acme"
							{...register("github")}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="discord">Discord</Label>
						<Input
							id="discord"
							type="url"
							placeholder="https://discord.gg/acme"
							{...register("discord")}
						/>
					</div>
				</div>
			</div>

			{/* Categories & Contacts */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
						Categories & Contacts
					</h3>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							appendCategory({
								name: "",
								contacts: [{ product: "", handles: [""], email: "", discord: "" }],
							})
						}
					>
						<Plus className="h-4 w-4" />
						Add Category
					</Button>
				</div>

				{errors.categories?.message && (
					<p className="text-sm text-red-600">{errors.categories.message}</p>
				)}

				<div className="space-y-6">
					{categoryFields.map((categoryField, categoryIndex) => (
						<CategorySection
							key={categoryField.id}
							categoryIndex={categoryIndex}
							register={register}
							control={control}
							errors={errors}
							watch={watch}
							onRemove={() => removeCategory(categoryIndex)}
							canRemove={categoryFields.length > 1}
						/>
					))}
				</div>
			</div>

			{/* Submit */}
			<div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<svg
								className="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Creating PR...
						</>
					) : (
						<>{isEdit ? "Update & Create PR" : "Submit & Create PR"}</>
					)}
				</Button>
			</div>
		</form>
	);
}

// Category Section Component
interface CategorySectionProps {
	categoryIndex: number;
	register: ReturnType<typeof useForm<CompanyFormData>>["register"];
	control: ReturnType<typeof useForm<CompanyFormData>>["control"];
	errors: ReturnType<typeof useForm<CompanyFormData>>["formState"]["errors"];
	watch: ReturnType<typeof useForm<CompanyFormData>>["watch"];
	onRemove: () => void;
	canRemove: boolean;
}

function CategorySection({
	categoryIndex,
	register,
	control,
	errors,
	watch,
	onRemove,
	canRemove,
}: CategorySectionProps) {
	const {
		fields: contactFields,
		append: appendContact,
		remove: removeContact,
	} = useFieldArray({
		control,
		name: `categories.${categoryIndex}.contacts`,
	});

	const categoryErrors = errors.categories?.[categoryIndex];

	return (
		<div className="rounded-lg border-2 border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
			<div className="flex items-start justify-between gap-4 mb-4">
				<div className="flex-1 space-y-2">
					<Label htmlFor={`category-${categoryIndex}-name`}>
						Category Name *
					</Label>
					<Input
						id={`category-${categoryIndex}-name`}
						placeholder="e.g., Engineering, Product, Design"
						{...register(`categories.${categoryIndex}.name`)}
					/>
					{categoryErrors?.name && (
						<p className="text-sm text-red-600">{categoryErrors.name.message}</p>
					)}
				</div>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onRemove}
						className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-sm text-zinc-600 dark:text-zinc-400">
						Contacts
					</Label>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() =>
							appendContact({ product: "", handles: [""], email: "", discord: "" })
						}
					>
						<Plus className="h-4 w-4" />
						Add Contact
					</Button>
				</div>

				{categoryErrors?.contacts?.message && (
					<p className="text-sm text-red-600">
						{categoryErrors.contacts.message}
					</p>
				)}

				{contactFields.map((contactField, contactIndex) => (
					<ContactRow
						key={contactField.id}
						categoryIndex={categoryIndex}
						contactIndex={contactIndex}
						register={register}
						control={control}
						errors={errors}
						watch={watch}
						onRemove={() => removeContact(contactIndex)}
						canRemove={contactFields.length > 1}
					/>
				))}
			</div>
		</div>
	);
}

// Contact Row Component
interface ContactRowProps {
	categoryIndex: number;
	contactIndex: number;
	register: ReturnType<typeof useForm<CompanyFormData>>["register"];
	control: ReturnType<typeof useForm<CompanyFormData>>["control"];
	errors: ReturnType<typeof useForm<CompanyFormData>>["formState"]["errors"];
	watch: ReturnType<typeof useForm<CompanyFormData>>["watch"];
	onRemove: () => void;
	canRemove: boolean;
}

function ContactRow({
	categoryIndex,
	contactIndex,
	register,
	control,
	errors,
	watch,
	onRemove,
	canRemove,
}: ContactRowProps) {
	const {
		fields: handleFields,
		append: appendHandle,
		remove: removeHandle,
	} = useFieldArray({
		control,
		name: `categories.${categoryIndex}.contacts.${contactIndex}.handles`,
	});

	const contactErrors =
		errors.categories?.[categoryIndex]?.contacts?.[contactIndex];

	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
			<div className="flex items-start justify-between gap-4 mb-4">
				<div className="flex-1 grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>Product/Role *</Label>
						<Input
							placeholder="e.g., Frontend Dev, DevRel"
							{...register(
								`categories.${categoryIndex}.contacts.${contactIndex}.product`,
							)}
						/>
						{contactErrors?.product && (
							<p className="text-sm text-red-600">
								{contactErrors.product.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label>Email (optional)</Label>
						<Input
							type="email"
							placeholder="contact@company.com"
							{...register(
								`categories.${categoryIndex}.contacts.${contactIndex}.email`,
							)}
						/>
					</div>
				</div>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onRemove}
						className="text-zinc-500 hover:text-red-600"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>X (Twitter) Handles *</Label>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => appendHandle("")}
					>
						<Plus className="h-4 w-4" />
						Add Handle
					</Button>
				</div>
				{contactErrors?.handles?.message && (
					<p className="text-sm text-red-600">{contactErrors.handles.message}</p>
				)}
				<div className="flex flex-wrap gap-2">
					{handleFields.map((handleField, handleIndex) => (
						<div key={handleField.id} className="flex items-center gap-1">
							<Input
								className="w-40"
								placeholder="@username"
								{...register(
									`categories.${categoryIndex}.contacts.${contactIndex}.handles.${handleIndex}`,
								)}
							/>
							{handleFields.length > 1 && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => removeHandle(handleIndex)}
									className="h-8 w-8 text-zinc-500 hover:text-red-600"
								>
									<X className="h-3 w-3" />
								</Button>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
