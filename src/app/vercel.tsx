'use client';

import { createFileRoute } from '@tanstack/react-router';
import { ContactsList } from '@/components/contacts-list';
import type { Category } from '@/types/contacts';

export const Route = createFileRoute('/vercel')({
  component: VercelPage,
});

function VercelPage() {
  const categories: Category[] = [
    {
      name: 'Frameworks & OSS',
      contacts: [
        { product: 'Next.js', handles: ['@timneutkens'] },
        { product: 'Nuxt.js', handles: ['@Atinux'] },
        { product: 'Turbopack', handles: ['@timneutkens'] },
        { product: 'Turborepo', handles: ['@anthonysheww'] },
        { product: 'shadcn/ui', handles: ['@shadcn'] },
        { product: 'Workflows', handles: ['@TooTallNate', '@pranaygp'] },
        { product: 'AI Elements / Streamdown / next-forge', handles: ['@haydenbleasel'] },
        { product: 'tweakcn', handles: ['@iamsahaj_xyz'] },
      ],
    },
    {
      name: 'Public Vercel Sites & Community',
      contacts: [
        {
          product: 'Community',
          handles: ['@GabbyShires', '@paulienuh', '@AmyAEgan', '@jacobmparis', '@sun_anshuman', '@kapehe_ok'],
        },
        { product: 'Blog / Changelog / Marketing pages / Event pages', handles: ['@ZeeJab'] },
        { product: 'Vercel Sites', handles: ['@plmrry'] },
      ],
    },
    {
      name: 'Vercel products',
      contacts: [
        { product: 'Domains', handles: ['@RhysSullivan', '@ethanniser'] },
        { product: 'Functions / Runtime / Compute', handles: ['@tomlienard', '@dglsparsons', '@gudmundur'] },
        { product: 'Builds', handles: ['@SheardLuke', '@gudmundur'] },
        { product: 'Observability / Speed Insights / Web Analytics', handles: ['@linstobias', '@malavikabala'] },
        { product: 'Auth', handles: ['@okbel'] },
        { product: 'Toolbar', handles: ['@gkaragkiaouris'] },
        { product: 'Dashboard', handles: ['@witsdev', '@z0oks', '@JohnPhamous'] },
        { product: 'Marketplace / Integrations', handles: ['@th_mdo'] },
        { product: 'Enterprise', handles: ['@sceiler'] },
        { product: 'Image Optimization', handles: ['@styfle'] },
        { product: 'BotID', handles: ['@andrewqu'] },
        { product: 'Vercel Agent', handles: ['@JohnPhamous'] },
        { product: 'Sandbox', handles: ['@gudmundur'] },
      ],
    },
    {
      name: 'v0 & AI',
      contacts: [
        {
          product: 'v0',
          handles: ['@max_leiter', '@EstebanSuarez', '@rickeyswuave', '@sonofalli', '@FernandoTheRojo', '@montonenico'],
        },
        { product: 'v0 Enterprise', handles: ['@TheWuster935'] },
        { product: 'v0 Design Systems', handles: ['@TheWuster935'] },
        { product: 'AI SDK', handles: ['@nishimiya', '@nicoalbanese10'] },
        { product: 'AI Gateway', handles: ['@rtaneja_'] },
        { product: 'MCP', handles: ['@allenzhou101', '@andrewqu'] },
        { product: 'Next.js Evals', handles: ['@MattLenhard'] },
      ],
    },
    {
      name: 'Other',
      contacts: [
        { product: 'Mobile', handles: ['@FernandoTheRojo'] },
        { product: 'Architecture / Implementation questions', handles: ['@philzona'] },
        { product: 'Vercel Professional Services', handles: ['@dom_sipowicz', '@goncy'] },
        { product: 'Terraform Support', handles: ['@dglsparsons'] },
      ],
    },
  ];

  const logo = (
    <svg height="30" viewBox="0 0 283 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
      />
    </svg>
  );

  return <ContactsList categories={categories} companyName="Vercel" logo={logo} />;
}

