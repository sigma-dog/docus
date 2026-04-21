import { lazy } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from 'react-router-dom';

const Index = lazy(() => import('pages/index'));
const Auth = lazy(() => import('pages/auth'));
const Home = lazy(() => import('pages/home'));
const LayoutWithSidebar = lazy(() => import('pages/layoutWithSidebar'));
const LayoutWithMainHeader = lazy(() => import('pages/layoutWithMainHeader'));

export const mainRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<Index />} />
            <Route path="auth" element={<Auth />} />

            <Route element={<LayoutWithSidebar />}>
                <Route element={<LayoutWithMainHeader />}>
                    <Route path="home" element={<Home />} />
                </Route>
            </Route>
        </Route>
    )
);
