import { LuBell, LuSettings } from 'react-icons/lu';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { Avatar, HStack, Icon, IconButton, Tabs } from '@chakra-ui/react';

import { useGetCurrentUserQuery } from 'shared/api';
import { getUserInfo } from 'shared/lib';
import { OrganizationAiChat } from 'widgets/organizationAiChat';
import { UserProfileDialog } from 'widgets/userProfileDialog';
import { UserSettingsMenu } from 'widgets/userSettingsMenu';

import { SearchBox } from './SearchBox';

export const Header = () => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey?: string;
    }>();
    const navigate = useNavigate();
    const { data: currentUser } = useGetCurrentUserQuery();

    const onSpacesPage = !!useMatch('/:orgSlug/spaces');

    const activeTab = onSpacesPage ? 'spaces' : 'home';

    const handleTabChange = (value: string) => {
        if (!orgSlug) {
            return;
        }
        if (value === 'spaces') {
            navigate(`/${orgSlug}/spaces`);
        } else if (value === 'home') {
            navigate(`/${orgSlug}/${spaceKey ?? ''}`);
        }
    };

    const user = currentUser ?? getUserInfo();

    return (
        <HStack
            justify="space-between"
            px={4}
            borderBottomWidth="1px"
            borderColor="border.default"
            h="52px"
            flexShrink={0}
        >
            <HStack>
                <Tabs.Root
                    value={activeTab}
                    onValueChange={(e) => handleTabChange(e.value)}
                    variant="line"
                    h="full"
                >
                    <Tabs.List h="full" borderBottomWidth={0}>
                        <Tabs.Trigger value="home" h="full">
                            Главная
                        </Tabs.Trigger>
                        <Tabs.Trigger value="spaces" h="full">
                            Пространства
                        </Tabs.Trigger>
                        <Tabs.Trigger value="activities" h="full" disabled>
                            Активности
                        </Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack gap={2} flexShrink={0}>
                <SearchBox />
                <OrganizationAiChat />
                <Icon color="fg.muted" cursor="pointer" boxSize={5}>
                    <LuBell />
                </Icon>
                <UserSettingsMenu
                    trigger={
                        <IconButton
                            aria-label="Открыть меню пользователя"
                            variant="ghost"
                            size="sm"
                            color="fg.muted"
                        >
                            <LuSettings />
                        </IconButton>
                    }
                />
                <UserProfileDialog
                    trigger={
                        <IconButton
                            aria-label="Редактировать профиль"
                            variant="ghost"
                            size="sm"
                            p={0}
                            minW="auto"
                            borderRadius="full"
                        >
                            <Avatar.Root size="xs" shape="full">
                                {user?.avatarUrl ? (
                                    <Avatar.Image src={user.avatarUrl} />
                                ) : null}
                                <Avatar.Fallback
                                    name={user?.username ?? 'Пользователь'}
                                />
                            </Avatar.Root>
                        </IconButton>
                    }
                />
            </HStack>
        </HStack>
    );
};
