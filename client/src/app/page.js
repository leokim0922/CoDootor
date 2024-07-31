import { Title, Button } from '@mantine/core';
import Link from 'next/link';
import styles from "./page.module.css";

export default function Landing() {
  return (
    <div className={styles.landingPage}>
      <div className={styles.topPart}>
        <Title order={1} style={{ color: '#ffffff' }}>Welcome to CoDootor</Title>
        <div>
          <Button style={{ margin: '10px'}} component={Link} href="/home/">Home</Button>
          <Button style={{ margin: '10px'}} component={Link} href="https://github.students.cs.ubc.ca/CPSC310-2024S/Project-Groups-19-Lab-B">GitHub</Button>
        </div>
      </div>
    </div>
  );
}