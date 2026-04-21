import { lazy } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from 'react-router-dom';

import { OrgRoute } from 'pages/layoutWithSidebar/ui/OrgRoute';
import { ProtectedRoute } from 'pages/layoutWithSidebar/ui/ProtectedRoute';

const Index = lazy(() => import('pages/index'));
const Auth = lazy(() => import('pages/auth'));
const Onboarding = lazy(() => import('pages/onboarding'));
const LayoutWithSidebar = lazy(() => import('pages/layoutWithSidebar'));
const LayoutWithMainHeader = lazy(() => import('pages/layoutWithMainHeader'));
const SpaceHome = lazy(() => import('pages/spaceHome'));

export const mainRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<Index />} />
            <Route path="auth" element={<Auth />} />
            <Route path="onboarding" element={<Onboarding />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<LayoutWithSidebar />}>
                    <Route path=":orgSlug" element={<OrgRoute />}>
                        <Route element={<LayoutWithMainHeader />}>
                            <Route path=":spaceKey" element={<SpaceHome />} />
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Route>
    )
);
