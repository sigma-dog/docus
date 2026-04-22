export const apiMethods = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
} as const;

export const tagTypes = {
    CurrentUser: 'CurrentUser',
    Spaces: 'Spaces',
    Organizations: 'Organizations',
    Pages: 'Pages',
} as const;
