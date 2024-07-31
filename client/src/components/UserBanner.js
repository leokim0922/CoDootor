'use server'

import React from 'react';
import { Space, Image, Title } from '@mantine/core';
import styles from '../app/page.module.css';
import GetUser from '@/util/GetUser';
import Link from 'next/link';
import moreStyles from '@/components/links.module.css';

export default async function UserBanner({ sessionInfo, userData }) {

  return (
    <div className={styles.logo}>
      <Image h={79} w="auto" fit="contain" src={sessionInfo.user.picture}></Image>
      <Space w="md"></Space>
      <div>
        <Title order={1}>Welcome, <Link className={moreStyles.activeLinkStyle} href={"http://localhost:5173/profile/" + userData.user_id}>{sessionInfo.user.nickname}</Link>!</Title>
        <Title order={2}>Your score is {userData.num_points}</Title>
      </div>
    </div>
  );
};