import React from 'react';
import { Center, Button } from '@mantine/core';
import Link from 'next/link'

const LoginPrompt = () => {
    return (
        <div>
            <p>You must be logged in before you are able to access the application.</p>
            <Link href="/api/auth/login">
                <Button color="Green">Login</Button>
            </Link>
        </div>
    );
  };
  
  export default LoginPrompt;