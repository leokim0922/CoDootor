'use server'

import styles from "./page.module.css";
import { NavbarSimple } from "@/components/NavbarSimple/NavbarSimple";
import QuestionList from "@/components/QuestionList";
import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import LoginPrompt from "@/components/LoginPrompt";
import UserBanner from "@/components/UserBanner";
import GetUser from "@/util/GetUser";

export default async function Home() {
  const sessionInfo = await getSession();

  if (!sessionInfo) return (
  <div className={styles.loginPromptPage}>
    <LoginPrompt></LoginPrompt>
  </div>
  )
  const { accessToken } = await getAccessToken();
  const user = await GetUser(accessToken);

  const questions = await fetch(`http://host.docker.internal:5001/question_list`)
    .then(res => res.json())
    .then(res => JSON.parse(res))
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
          <QuestionList questions={questions} userData={user} />
        </div>
        

      </div>
    </div>
  )
}