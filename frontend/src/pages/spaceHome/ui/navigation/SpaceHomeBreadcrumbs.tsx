import { type FC, Fragment } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { Breadcrumb, Skeleton, Text } from '@chakra-ui/react';

import type { PageSummary } from 'shared/types';

type SpaceHomeBreadcrumbsProps = {
    orgSlug: string;
    spaceKey: string;
    orgName?: string;
    spaceName?: string;
    folderPath: PageSummary[];
    onRootClick: () => void;
};

export const SpaceHomeBreadcrumbs: FC<SpaceHomeBreadcrumbsProps> = ({
    orgSlug,
    spaceKey,
    orgName,
    spaceName,
    folderPath,
    onRootClick,
}) => {
    const crumbMaxWidth = '180px';

    return (
        <Breadcrumb.Root>
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <Breadcrumb.Link asChild>
                        <Link to={`/${orgSlug}/spaces`}>
                            {orgName ? (
                                <Text
                                    as="span"
                                    display="inline-block"
                                    maxW={crumbMaxWidth}
                                    truncate
                                >
                                    {orgName}
                                </Text>
                            ) : (
                                <Skeleton h="4" w="24" />
                            )}
                        </Link>
                    </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator>
                    <LuChevronRight />
                </Breadcrumb.Separator>
                <Breadcrumb.Item>
                    <Breadcrumb.Link asChild>
                        <Link
                            to={`/${orgSlug}/${spaceKey}`}
                            onClick={onRootClick}
                        >
                            {spaceName ? (
                                <Text
                                    as="span"
                                    display="inline-block"
                                    maxW={crumbMaxWidth}
                                    truncate
                                >
                                    {spaceName}
                                </Text>
                            ) : (
                                <Skeleton h="4" w="32" />
                            )}
                        </Link>
                    </Breadcrumb.Link>
                </Breadcrumb.Item>
                {folderPath.map((folder, index) => {
                    const isLast = index === folderPath.length - 1;

                    return (
                        <Fragment key={folder.id}>
                            <Breadcrumb.Separator>
                                <LuChevronRight />
                            </Breadcrumb.Separator>
                            <Breadcrumb.Item>
                                {isLast ? (
                                    <Breadcrumb.CurrentLink
                                        display="inline-block"
                                        maxW={crumbMaxWidth}
                                        truncate
                                    >
                                        {folder.title}
                                    </Breadcrumb.CurrentLink>
                                ) : (
                                    <Breadcrumb.Link asChild>
                                        <Link
                                            to={`/${orgSlug}/${spaceKey}?folderId=${folder.id}`}
                                        >
                                            <Text
                                                as="span"
                                                display="inline-block"
                                                maxW={crumbMaxWidth}
                                                truncate
                                            >
                                                {folder.title}
                                            </Text>
                                        </Link>
                                    </Breadcrumb.Link>
                                )}
                            </Breadcrumb.Item>
                        </Fragment>
                    );
                })}
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
};
