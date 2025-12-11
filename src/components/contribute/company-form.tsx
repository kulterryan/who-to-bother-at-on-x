import { useForm } from "@tanstack/react-form";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Company } from "@/types/company";

// Validation schemas
const contactSchema = v.object({
	product: v.pipe(v.string(), v.minLength(1, "Product/role name is required")),
	handles: v.pipe(
		v.array(v.string()),
		v.minLength(1, "At least one handle is required"),
	),
	email: v.optional(v.string()),
	discord: v.optional(v.string()),
});

const categorySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Category name is required")),
	contacts: v.pipe(
		v.array(contactSchema),
		v.minLength(1, "At least one contact is required"),
	),
});

const companySchema = v.object({
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
		v.array(categorySchema),
		v.minLength(1, "At least one category is required"),
	),
});

type CompanyFormData = v.InferOutput<typeof companySchema>;

interface CompanyFormProps {
	initialData?: Company;
	onSubmit: (data: Company) => void;
	onFormChange?: (data: Company) => void;
	isSubmitting?: boolean;
	isEdit?: boolean;
	hideSubmitButton?: boolean;
}

// Helper to extract first error message from errors array
function getFirstError(
	errors: ReadonlyArray<unknown>,
): string | undefined {
	if (errors.length === 0) return ;
	const first = errors.at(0);
	if (typeof first === "string") return first;
	if (first && typeof first === "object" && "message" in first) {
		return String((first as { message: unknown }).message);
	}
	return ;
}

export function CompanyForm({
	initialData,
	onSubmit,
	onFormChange,
	isSubmitting = false,
	isEdit = false,
	hideSubmitButton = false,
}: CompanyFormProps) {
	const form = useForm({
		defaultValues: (initialData || {
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
		}) as CompanyFormData,
		validators: {
			onChange: companySchema,
		},
		onSubmit: async ({ value }) => {
			// Clean up empty optional fields
			const cleanedData: Company = {
				...value,
				website: value.website || undefined,
				docs: value.docs || undefined,
				github: value.github || undefined,
				discord: value.discord || undefined,
				categories: value.categories.map((cat) => ({
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
		},
	});

	// Auto-generate ID from name
	const handleNameChange = (name: string) => {
		if (!isEdit) {
			const id = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");
			form.setFieldValue("id", id);
			form.setFieldValue("logoType", id);
		}
	};

	// Subscribe to form value changes for live preview
	useEffect(() => {
		if (!onFormChange) return;

		const unsubscribe = form.store.subscribe(() => {
			const values = form.store.state.values;
			onFormChange(values as Company);
		});

		return unsubscribe;
	}, [form.store, onFormChange]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-8"
		>
			{/* Basic Information */}
			<div className="space-y-6">
				<h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
					Basic Information
				</h3>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }: { value: string }) =>
								value ? undefined : "Company name is required",
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="name">Company Name *</Label>
								<Input
									id="name"
									placeholder="Acme Inc"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => {
										field.handleChange(e.target.value);
										handleNameChange(e.target.value);
									}}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-red-600 text-sm">
										{getFirstError(field.state.meta.errors)}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="id"
						validators={{
							onChange: ({ value }: { value: string }) => {
								if (!value) return "Company ID is required";
								if (!/^[a-z0-9-]+$/.test(value)) {
									return "ID must be lowercase with only letters, numbers, and hyphens";
								}
								return ;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="id">Company ID *</Label>
								<Input
									id="id"
									placeholder="acme-inc"
									disabled={isEdit}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-red-600 text-sm">
										{getFirstError(field.state.meta.errors)}
									</p>
								)}
								<p className="text-xs text-zinc-500">
									Lowercase, letters, numbers, and hyphens only
								</p>
							</div>
						)}
					</form.Field>
				</div>

				<form.Field
					name="description"
					validators={{
						onChange: ({ value }: { value: string }) =>
							value ? undefined : "Description is required",
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								placeholder="Brief description of what your company does"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-600 text-sm">
									{getFirstError(field.state.meta.errors)}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field
					name="logoType"
					validators={{
						onChange: ({ value }: { value: string }) =>
							value ? undefined : "Logo type is required",
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="logoType">Logo Type *</Label>
							<Input
								id="logoType"
								placeholder="acme-inc"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-600 text-sm">
									{getFirstError(field.state.meta.errors)}
								</p>
							)}
							<p className="text-xs text-zinc-500">
								This should match your company ID
							</p>
						</div>
					)}
				</form.Field>
			</div>

			{/* Links */}
			<div className="space-y-6">
				<h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
					Links (Optional)
				</h3>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="website">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="website">Website</Label>
								<Input
									id="website"
									type="url"
									placeholder="https://acme.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="docs">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="docs">Documentation</Label>
								<Input
									id="docs"
									type="url"
									placeholder="https://docs.acme.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="github">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="github">GitHub</Label>
								<Input
									id="github"
									type="url"
									placeholder="https://github.com/acme"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="discord">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="discord">Discord</Label>
								<Input
									id="discord"
									type="url"
									placeholder="https://discord.gg/acme"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Categories & Contacts */}
			<div className="space-y-6">
				<form.Field name="categories" mode="array">
					{(categoriesField) => (
						<>
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
									Categories & Contacts
								</h3>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										categoriesField.pushValue({
											name: "",
											contacts: [
												{ product: "", handles: [""], email: "", discord: "" },
											],
										})
									}
								>
									<Plus className="h-4 w-4" />
									Add Category
								</Button>
							</div>

							{categoriesField.state.meta.errors.length > 0 && (
								<p className="text-red-600 text-sm">
									{getFirstError(categoriesField.state.meta.errors)}
								</p>
							)}

							<div className="space-y-6">
								{categoriesField.state.value.map((_, categoryIndex) => (
									<div
										key={categoryIndex}
										className="rounded-lg border-2 border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
									>
										<div className="mb-4 flex items-start justify-between gap-4">
											<form.Field
												name={`categories[${categoryIndex}].name`}
												validators={{
													onChange: ({ value }: { value: string }) =>
														value ? undefined : "Category name is required",
												}}
											>
												{(field) => (
													<div className="flex-1 space-y-2">
														<Label htmlFor={`category-${categoryIndex}-name`}>
															Category Name *
														</Label>
														<Input
															id={`category-${categoryIndex}-name`}
															placeholder="e.g., Engineering, Product, Design"
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
														/>
														{field.state.meta.errors.length > 0 && (
															<p className="text-red-600 text-sm">
																{getFirstError(field.state.meta.errors)}
															</p>
														)}
													</div>
												)}
											</form.Field>
											{categoriesField.state.value.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() =>
														categoriesField.removeValue(categoryIndex)
													}
													className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>

										<form.Field
											name={`categories[${categoryIndex}].contacts`}
											mode="array"
										>
											{(contactsField) => (
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
																contactsField.pushValue({
																	product: "",
																	handles: [""],
																	email: "",
																	discord: "",
																})
															}
														>
															<Plus className="h-4 w-4" />
															Add Contact
														</Button>
													</div>

													{contactsField.state.meta.errors.length > 0 && (
														<p className="text-red-600 text-sm">
															{getFirstError(contactsField.state.meta.errors)}
														</p>
													)}

													{contactsField.state.value.map((_, contactIndex) => (
														<div
															key={contactIndex}
															className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
														>
															<div className="mb-4 flex items-start justify-between gap-4">
																<div className="grid flex-1 gap-4 sm:grid-cols-2">
																	<form.Field
																		name={`categories[${categoryIndex}].contacts[${contactIndex}].product`}
																		validators={{
																			onChange: ({
																				value,
																			}: { value: string }) =>
																				value
																					? undefined : "Product/role name is required",
																		}}
																	>
																		{(field) => (
																			<div className="space-y-2">
																				<Label>Product/Role *</Label>
																				<Input
																					placeholder="e.g., Frontend Dev, DevRel"
																					value={field.state.value}
																					onBlur={field.handleBlur}
																					onChange={(e) =>
																						field.handleChange(e.target.value)
																					}
																				/>
																				{field.state.meta.errors.length > 0 && (
																					<p className="text-red-600 text-sm">
																						{getFirstError(
																							field.state.meta.errors,
																						)}
																					</p>
																				)}
																			</div>
																		)}
																	</form.Field>

																	<form.Field
																		name={`categories[${categoryIndex}].contacts[${contactIndex}].email`}
																	>
																		{(field) => (
																			<div className="space-y-2">
																				<Label>Email (optional)</Label>
																				<Input
																					type="email"
																					placeholder="contact@company.com"
																					value={field.state.value}
																					onBlur={field.handleBlur}
																					onChange={(e) =>
																						field.handleChange(e.target.value)
																					}
																				/>
																			</div>
																		)}
																	</form.Field>
																</div>
																{contactsField.state.value.length > 1 && (
																	<Button
																		type="button"
																		variant="ghost"
																		size="icon"
																		onClick={() =>
																			contactsField.removeValue(contactIndex)
																		}
																		className="text-zinc-500 hover:text-red-600"
																	>
																		<X className="h-4 w-4" />
																	</Button>
																)}
															</div>

															<form.Field
																name={`categories[${categoryIndex}].contacts[${contactIndex}].handles`}
																mode="array"
															>
																{(handlesField) => (
																	<div className="space-y-2">
																		<div className="flex items-center justify-between">
																			<Label>X (Twitter) Handles *</Label>
																			<Button
																				type="button"
																				variant="ghost"
																				size="sm"
																				onClick={() =>
																					handlesField.pushValue("")
																				}
																			>
																				<Plus className="h-4 w-4" />
																				Add Handle
																			</Button>
																		</div>
																		{handlesField.state.meta.errors.length >
																			0 && (
																			<p className="text-red-600 text-sm">
																				{getFirstError(
																					handlesField.state.meta.errors,
																				)}
																			</p>
																		)}
																		<div className="flex flex-wrap gap-2">
																			{handlesField.state.value.map(
																				(_, handleIndex) => (
																					<form.Field
																						key={handleIndex}
																						name={`categories[${categoryIndex}].contacts[${contactIndex}].handles[${handleIndex}]`}
																					>
																						{(handleField) => (
																							<div className="flex items-center gap-1">
																								<Input
																									className="w-40"
																									placeholder="@username"
																									value={handleField.state.value}
																									onBlur={handleField.handleBlur}
																									onChange={(e) =>
																										handleField.handleChange(
																											e.target.value,
																										)
																									}
																								/>
																								{handlesField.state.value
																									.length > 1 && (
																									<Button
																										type="button"
																										variant="ghost"
																										size="icon"
																										onClick={() =>
																											handlesField.removeValue(
																												handleIndex,
																											)
																										}
																										className="h-8 w-8 text-zinc-500 hover:text-red-600"
																									>
																										<X className="h-3 w-3" />
																									</Button>
																								)}
																							</div>
																						)}
																					</form.Field>
																				),
																			)}
																		</div>
																	</div>
																)}
															</form.Field>
														</div>
													))}
												</div>
											)}
										</form.Field>
									</div>
								))}
							</div>
						</>
					)}
				</form.Field>
			</div>

			{/* Submit */}
			{!hideSubmitButton && (
				<div className="flex justify-end gap-4 border-zinc-200 border-t pt-4 dark:border-zinc-700">
					<form.Subscribe selector={(state) => state.canSubmit}>
						{(canSubmit) => (
							<Button type="submit" disabled={isSubmitting || !canSubmit}>
								{isSubmitting ? (
									<>
										<svg
											className="h-4 w-4 animate-spin"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<title>Loading</title>
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
									isEdit ? "Update & Create PR" : "Submit & Create PR"
								)}
							</Button>
						)}
					</form.Subscribe>
				</div>
			)}
		</form>
	);
}
