import { lazy } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from 'react-router-dom';

import { OrgRoute } from 'pages/orgRoute';
import { ProtectedRoute } from 'pages/protectedRoute';

const Index = lazy(() => import('pages/index'));
const Auth = lazy(() => import('pages/auth'));
const Onboarding = lazy(() => import('pages/onboarding'));
const LayoutWithSidebar = lazy(() => import('pages/layoutWithSidebar'));
const LayoutWithMainHeader = lazy(() => import('pages/layoutWithMainHeader'));
const SpaceHome = lazy(() => import('pages/spaceHome'));
const PageView = lazy(() => import('pages/pageView'));
const Spaces = lazy(() => import('pages/spaces'));

export const mainRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<Index />} />
            <Route path="auth" element={<Auth />} />
            <Route path="onboarding" element={<Onboarding />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<LayoutWithSidebar />}>
                    <Route element={<LayoutWithMainHeader />}>
                        <Route path=":orgSlug" element={<OrgRoute />}>
                            <Route path="spaces" element={<Spaces />} />
                            <Route path=":spaceKey" element={<SpaceHome />} />
                            <Route
                                path=":spaceKey/pages/:pageId"
                                element={<PageView />}
                            />
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Route>
    )
);
