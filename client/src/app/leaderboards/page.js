'use server'

// import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { NavbarSimple } from "@/components/NavbarSimple/NavbarSimple";
import LeaderboardTable from "@/components/LeaderboardTable";
import { getSession } from '@auth0/nextjs-auth0';
import { withPageAuthRequired, getAccessToken } from '@auth0/nextjs-auth0';
import UserBanner from "@/components/UserBanner";
import GetUser from "@/util/GetUser";

export default withPageAuthRequired(async function LeaderboardPage() {

  const sessionInfo = await getSession();
  const users = await fetch("http://host.docker.internal:5001/leaderboard")
  .then(resp => resp.json())
  .catch(err => console.log(err));

  const { accessToken } = await getAccessToken();
  const user = await GetUser(accessToken);
  
  return (
    <div>
      <div className={styles.page}>
        <div>
          <NavbarSimple />
        </div>
        <div className={styles.centerColumn}>
          <UserBanner sessionInfo={sessionInfo} userData={user}/>
          <br></br>
          <LeaderboardTable users={users} cur_user_id={user.user_id}/>
        </div>
      </div>
    </div>
  );
}, { 'returnTo': '/leaderboards' });