import styles from './delete.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Request Account Deletion</h1>
      <p className={styles.text}>
        To request to delete your account, please email me using the email address below:
      </p>
      <p className={styles.email}>byte9962@gmail.com</p>
    </div>
  );
}
