import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center simulator-page" style={{ paddingTop: '80px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card bg-dark text-light p-5 rounded-4 border-secondary text-center"
            >
                <h1 className="display-1 text-warning">403</h1>
                <h2 className="mb-4">Unauthorized</h2>
                <p className="mb-4">You do not have access to the requested page.</p>
                <button className="btn btn-warning" onClick={goBack}>Go Back</button>
            </motion.div>
        </div>
    );
};

export default UnauthorizedPage; 