import React from 'react';
import { Button } from '@mantine/core';
import { useUser } from '@auth0/nextjs-auth0/client';

const LogoutButton = () => {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div></div>
    if (error) return <div>{error.message}</div>

    return user && (
        <Button color="Red"><a href="/api/auth/logout">Logout</a></Button>
    );
  };
  
  export default LogoutButton;