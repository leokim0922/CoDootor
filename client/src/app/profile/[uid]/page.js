'use server'

// import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { NavbarSimple } from "@/components/NavbarSimple/NavbarSimple";
import { getSession } from '@auth0/nextjs-auth0';
import { withPageAuthRequired, getAccessToken } from '@auth0/nextjs-auth0';
import UserBanner from "@/components/UserBanner";
import GetUser from "@/util/GetUser";
import UserProfile from "@/components/UserProfile";

export default withPageAuthRequired(async function ProfilePage({ params }) {
  const uid = params.uid;
  const sessionInfo = await getSession();
  let hasError = false;
  let numQuestions;

  const res = await fetch("http://host.docker.internal:5001/question_list/length").then(res => res.json())
  .catch(err => console.error(err));

  (res && res.num_questions) ? numQuestions = res.num_questions : numQuestions = 10;

  const otherUser = await fetch(`http://host.docker.internal:5001/otherUser?uid=${uid}`)
  .then(resp => {
    if (!resp.ok) hasError = true;
    return resp.json()
  })
  .catch(err => console.error(err) );

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
          {hasError ? otherUser.error : <UserProfile user={user} otherUser={otherUser} totalQuestions={numQuestions}></UserProfile>}
        </div>
      </div>
    </div>
  );
}, { 'returnTo': '/leaderboards' });