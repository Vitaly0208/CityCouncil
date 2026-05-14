
import { Link } from 'react-router-dom';
import { useCommittees} from "../../hooks/useCommittees.js";
import styles from './CommitteesPage.module.css';

const CommitteesPage = () => {
    const { committees, isLoading, isError } = useCommittees();

    if (isLoading) {
        return <div className={styles.loading}>Загрузка комиссий...</div>;
    }

    if (isError) {
        return <div className={styles.error}>Не удалось загрузить список</div>;
    }

    return (
        <div className={styles.grid}>
            {committees.map((committee) => (
                <Link key={committee.id} to={`/committees/${committee.id}`} className={styles.card}>
                    <h3 className={styles.title}>{committee.name}</h3>
                    <span className={styles.specialization}>{committee.specialization}</span>
                    <p className={styles.desc}>{committee.description || 'Описание отсутствует'}</p>
                    <div className={styles.footer}>
                        <span>👥 {committee.memberCount} членов</span>
                        {committee.chairmanName && <span>Пред: {committee.chairmanName}</span>}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default CommitteesPage;