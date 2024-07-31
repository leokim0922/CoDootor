'use server';

// import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { NavbarSimple } from "@/components/NavbarSimple/NavbarSimple";
import { getSession } from '@auth0/nextjs-auth0';
import { withPageAuthRequired, getAccessToken } from '@auth0/nextjs-auth0';
import UserBanner from "@/components/UserBanner";
import GetUser from "@/util/GetUser";
import StatsTable from "@/components/StatsTable";

export default withPageAuthRequired(async function StatsPage() {
  const sessionInfo = await getSession();
  const users = [];
  const { accessToken } = await getAccessToken();
  const user = await GetUser(accessToken);
  
  const stats = await fetch(`http://host.docker.internal:5001/stats`)
    .then(res => res.json())
    .then(res => res.question_list)
    .catch(error => console.error('Error fetching data:', error));
  return (
    <div>
      <div className={styles.page}>
        <div>
          <NavbarSimple />
        </div>
        <div className={styles.centerColumn}>
          <UserBanner sessionInfo={sessionInfo} userData={user}/>
          <br></br>
          <StatsTable stats={stats} userData={user}/>
        </div>
      </div>
    </div>
  );
}, { 'returnTo': '/stats' });