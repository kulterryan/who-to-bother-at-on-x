import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Search } from "lucide-react";
import { useState } from "react";
import { companyLogos } from "@/components/company-logos";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { seo } from "@/lib/seo";
import type { Company } from "@/types/company";

type CompanyListItem = {
	id: string;
	name: string;
	description: string;
	logoType: string;
};

// Import all company data at build time
const companyModules = import.meta.glob<{ default: Company }>(
	"../../data/companies/*.json",
	{
		eager: true,
	},
);

// Build company list
const allCompanies: CompanyListItem[] = [];
for (const [path, module] of Object.entries(companyModules)) {
	if (path.includes("template") || path.includes("schema")) { continue; }
	const company = module.default;
	if (company?.id) {
		allCompanies.push({
			id: company.id,
			name: company.name,
			description: company.description,
			logoType: company.logoType,
		});
	}
}

// Sort alphabetically
allCompanies.sort((a, b) => a.name.localeCompare(b.name));

export const Route = createFileRoute("/contribute/edit")({
	head: () => ({
		meta: [
			...seo({
				title: "Edit Company | who to bother on X",
				description:
					"Select a company to edit. Update information and contacts.",
				keywords: "edit company, update, contribute",
				url: "https://who-to-bother-at.com/contribute/edit",
				image: "https://who-to-bother-at.com/opengraph",
			}),
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
		],
	}),
	component: EditCompanySelectPage,
});

function EditCompanySelectPage() {
	const { data: session, isPending: sessionPending } = useSession();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");

	const filteredCompanies = allCompanies.filter(
		(company) =>
			company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			company.id.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (sessionPending) {
		return (
			<div className="flex min-h-screen items-center justify-center text-zinc-900 dark:text-zinc-100">
				<div className="flex items-center gap-2">
					<svg
						className="h-5 w-5 animate-spin"
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
					<span>Loading...</span>
				</div>
			</div>
		);
	}

	if (!session) {
		navigate({ to: "/login" });
		return null;
	}

	return (
		<div className="min-h-screen text-zinc-900 dark:text-zinc-100">
			<main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/contribute"
						className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Contribute
					</Link>
				</div>

				{/* Page Title */}
				<div className="mb-8">
					<h2 className="font-bold text-3xl">Edit Company</h2>
					<p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
						Select a company to edit. You can update information, contacts, and
						logos.
					</p>
				</div>

				{/* Search */}
				<div className="relative mb-6">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-zinc-500" />
					<Input
						placeholder="Search companies..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Company List */}
				<div className="space-y-3">
					{filteredCompanies.length === 0 && (
						<div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
							<Building2 className="mx-auto h-12 w-12 text-zinc-400" />
							<p className="mt-4 text-zinc-600 dark:text-zinc-400">
								{searchQuery
									? "No companies found matching your search"
									: "No companies available"}
							</p>
						</div>
					)}

					{filteredCompanies.map((company) => {
						const Logo = companyLogos[company.logoType];

						return (
							<Link
								key={company.id}
								to="/contribute/edit/$company"
								params={{ company: company.id }}
								className="flex items-center gap-4 rounded-lg border-2 border-zinc-200 bg-white p-4 transition-all hover:border-orange-600 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
									{Logo || <Building2 className="h-6 w-6 text-zinc-400" />}
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="truncate font-semibold">{company.name}</h3>
									<p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
										{company.description}
									</p>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-zinc-400"
								>
									<path d="m9 18 6-6-6-6" />
								</svg>
							</Link>
						);
					})}
				</div>
			</main>
		</div>
	);
}
