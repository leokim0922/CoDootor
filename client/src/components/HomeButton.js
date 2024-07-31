import React from 'react';
//import Link from 'next/link';
import { Button } from '@mantine/core'

// link to the home page
const HomeButton = () => {
  const handleHomeClick = () => {
    window.location.href = "/home";
  };

  return (
    <Button variant="filled" onClick={handleHomeClick}>
      Home
    </Button>
  );
};

export default HomeButton;
