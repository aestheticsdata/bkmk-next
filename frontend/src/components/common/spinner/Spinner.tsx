import styles from './Spinner.module.css';

const Spinner = () => {
  return (
    <div className={styles.loader}>
      <div className={styles['loader-inner']} />
    </div>
  );
};

export default Spinner;
