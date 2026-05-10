import { type FC, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@chakra-ui/react';

import {
    useGetOrganizationQuery,
    useGetPagesQuery,
    useGetSpaceQuery,
} from 'shared/api';
import type { PageSummary } from 'shared/types';

type BreadcrumbsProps = {
    orgSlug: string;
    spaceKey: string;
    pageId: string;
};

const findAncestors = (
    pages: PageSummary[],
    targetId: string
): PageSummary[] => {
    const findPath = (
        nodes: PageSummary[],
        id: string
    ): PageSummary[] | null => {
        for (const node of nodes) {
            if (node.id === id) {
                return [node];
            }
            const childPath = findPath(node.children, id);
            if (childPath) {
                return [node, ...childPath];
            }
        }
        return null;
    };
    return findPath(pages, targetId) ?? [];
};

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
    orgSlug,
    spaceKey,
    pageId,
}) => {
    const { data: org } = useGetOrganizationQuery(orgSlug);
    const { data: space } = useGetSpaceQuery({
        key: spaceKey,
        organizationSlug: orgSlug,
    });
    const { data: pages } = useGetPagesQuery({ orgSlug, spaceKey });

    const ancestors = pages ? findAncestors(pages, pageId) : [];
    const ancestorPages = ancestors.slice(0, -1);
    const currentPage = ancestors[ancestors.length - 1];

    return (
        <Breadcrumb.Root>
            <Breadcrumb.List>
                {org && (
                    <Breadcrumb.Item>
                        <Breadcrumb.Link asChild>
                            <Link to={`/${orgSlug}/spaces`}>{org.name}</Link>
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                )}
                {org && space && <Breadcrumb.Separator />}
                {space && (
                    <Breadcrumb.Item>
                        <Breadcrumb.Link asChild>
                            <Link to={`/${orgSlug}/${spaceKey}`}>
                                {space.name}
                            </Link>
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                )}
                {ancestorPages.map(({ id, title, isFolder }) => (
                    <Fragment key={id}>
                        <Breadcrumb.Separator key={`sep-${id}`} />
                        <Breadcrumb.Item key={id}>
                            <Breadcrumb.Link asChild>
                                <Link
                                    to={
                                        isFolder
                                            ? `/${orgSlug}/${spaceKey}?folderId=${id}`
                                            : `/${orgSlug}/${spaceKey}/pages/${id}`
                                    }
                                >
                                    {title}
                                </Link>
                            </Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Fragment>
                ))}
                {currentPage && (
                    <>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.CurrentLink>
                                {currentPage.title}
                            </Breadcrumb.CurrentLink>
                        </Breadcrumb.Item>
                    </>
                )}
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
};
