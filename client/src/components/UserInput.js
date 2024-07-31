import React from 'react';
import styles from '../app/page.module.css';

const UserInput = () => {
  return (
    <div className="user-input">
      <textarea className={styles.textarea} placeholder="Please input your description for the given function"></textarea>
    </div>
  );
};

export default UserInput;
