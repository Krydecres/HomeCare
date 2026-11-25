import { useTranslation } from 'react-i18next';
import { createBrowserRouter, Link, type RouteObject } from 'react-router';
import { SplashPage } from '@/features/auth/pages/SplashPage';
import { HcEmptyState } from '@/shared/ui/states/HcEmptyState';
import { RequireRole } from './RequireRole';
import { RoutePlaceholder } from './RoutePlaceholder';

/**
 * Routes by role (US-15-008, 13_RBAC). Each area is guarded by RequireRole and framed by HcAppShell.
 * Feature owners (18_Code_Packages) replace a RoutePlaceholder with their XxxPage when its wireframe is "Đã duyệt".
 * Only TV1 merges changes to this file (AGENTS.md 4d).
 */
function StatusPage({ kind }: { kind: 'forbidden' | 'notFound' }) {
  const { t } = useTranslation();
  return (
    <main id="main" className="flex min-h-screen items-center justify-center">
      <HcEmptyState
        icon={kind === 'forbidden' ? 'block' : 'search_off'}
        title={t(kind === 'forbidden' ? 'state.forbiddenTitle' : 'state.notFoundTitle')}
        hint={kind === 'forbidden' ? t('state.forbiddenHint') : undefined}
        action={
          <Link to="/" className="text-hc-body font-semibold text-hc-primary">
            {t('state.backHome')}
          </Link>
        }
      />
    </main>
  );
}

const placeholder = (path: string, wf: string): RouteObject => ({ path, element: <RoutePlaceholder wf={wf} /> });

export const routes: RouteObject[] = [
  { path: '/', element: <SplashPage /> },
  placeholder('/register', 'WF-S-02'),
  { path: '/forbidden', element: <StatusPage kind="forbidden" /> },
  {
    path: '/customer',
    element: <RequireRole anyOf={['CUSTOMER', 'CAREGIVER_PENDING', 'CAREGIVER']} variant="customer" />,
    children: [
      { index: true, element: <RoutePlaceholder wf="WF-C-01" /> },
      placeholder('bookings', 'WF-C-08'),
      placeholder('care-recipients', 'WF-C-03'),
      placeholder('notifications', 'WF-S-06'),
    ],
  },
  {
    path: '/caregiver',
    element: <RequireRole anyOf={['CAREGIVER']} variant="caregiver" />,
    children: [
      { index: true, element: <RoutePlaceholder wf="WF-N-05" /> },
      placeholder('schedule', 'WF-N-06'),
      placeholder('earnings', 'WF-N-12'),
      placeholder('notifications', 'WF-S-06'),
    ],
  },
  {
    path: '/elder',
    element: <RequireRole anyOf={['ELDER']} variant="elder" />,
    children: [{ index: true, element: <RoutePlaceholder wf="WF-C-18" /> }],
  },
  {
    path: '/dispatch',
    element: <RequireRole anyOf={['DISPATCHER']} variant="dispatcher" />,
    children: [
      { index: true, element: <RoutePlaceholder wf="WF-D-01" /> },
      placeholder('incidents', 'WF-D-03'),
      placeholder('complaints', 'WF-D-06'),
      placeholder('assisted-booking', 'WF-D-05'),
    ],
  },
  {
    path: '/admin',
    element: <RequireRole anyOf={['ADMIN']} variant="admin" />,
    children: [
      { index: true, element: <RoutePlaceholder wf="WF-A-01" /> },
      placeholder('caregiver-review', 'WF-A-02'),
      placeholder('partner-orgs', 'WF-A-10'),
      placeholder('services', 'WF-A-03'),
      placeholder('service-areas', 'WF-A-04'),
      placeholder('policies', 'WF-A-05'),
      placeholder('users', 'WF-A-06'),
      placeholder('audit-logs', 'WF-A-07'),
      placeholder('reports', 'WF-A-08'),
      placeholder('moderation', 'WF-A-09'),
    ],
  },
  {
    path: '/accounting',
    element: <RequireRole anyOf={['ACCOUNTANT']} variant="accountant" />,
    children: [
      { index: true, element: <RoutePlaceholder wf="WF-K-01" /> },
      placeholder('payouts', 'WF-K-02'),
      placeholder('refunds', 'WF-K-03'),
      placeholder('revenue', 'WF-K-04'),
    ],
  },
  {
    path: '/partner',
    element: <RequireRole anyOf={['PARTNER_ORG']} variant="partnerOrg" />,
    children: [
      { index: true, element: <RoutePlaceholder wf="WF-P-01" /> },
      placeholder('role-change-requests', 'WF-P-01'),
      placeholder('staff', 'WF-P-01'),
      placeholder('revenue', 'WF-P-02'),
    ],
  },
  { path: '*', element: <StatusPage kind="notFound" /> },
];

export const createAppRouter = () => createBrowserRouter(routes);
