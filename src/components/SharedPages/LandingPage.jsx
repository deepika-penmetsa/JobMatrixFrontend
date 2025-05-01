import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/LandingPage.module.css";
import logoImage from "../../assets/logo.svg";
import { motion } from "framer-motion";
import {
    MdBusinessCenter,
    MdCode,
    MdOutlineTrendingUp
} from "react-icons/md";

const LandingPage = () => {
    const [activeFeature, setActiveFeature] = useState(null);

    const features = [
        {
            id: "jobs",
            icon: MdBusinessCenter,
            title: "Connect with Jobs",
            color: "#3a70e3",
            description: "Find opportunities aligned with your skills and career goals"
        },
        {
            id: "tech",
            icon: MdCode,
            title: "Tech Opportunities",
            color: "#8456ec",
            description: "Discover roles in the latest technologies and growing sectors"
        },
        {
            id: "growth",
            icon: MdOutlineTrendingUp,
            title: "Career Growth",
            color: "#ff6b6b",
            description: "Access resources to advance your professional journey"
        }
    ];

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <motion.div
                className={styles.hero}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Left Section - Logo & Content */}
                <motion.div
                    className={styles.left}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.img
                        src={logoImage}
                        alt="JobMatrix Logo"
                        className={styles.logo}
                        whileHover={{ scale: 1.05 }}
                    />
                    <motion.h1
                        className={styles.heading}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <span className={styles.gradient}>Future-proof</span> your career journey
                    </motion.h1>
                    <motion.p
                        className={styles.subheading}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        Connect with cutting-edge opportunities and world-class talent. Your next career breakthrough starts here.
                    </motion.p>

                    <motion.div
                        className={styles.buttons}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <Link to="/login">
                            <motion.button
                                className={`${styles.button} ${styles.primaryButton}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                LOGIN
                            </motion.button>
                        </Link>
                        <Link to="/signup">
                            <motion.button
                                className={`${styles.button} ${styles.secondaryButton}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                SIGN UP
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Right Section - Feature Icons */}
                <motion.div
                    className={styles.right}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className={styles.featureIconsContainer}>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const isActive = activeFeature === feature.id;

                            return (
                                <motion.div
                                    key={feature.id}
                                    className={`${styles.featureIconWrapper} ${isActive ? styles.active : ''}`}
                                    onMouseEnter={() => setActiveFeature(feature.id)}
                                    onMouseLeave={() => setActiveFeature(null)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: isActive ? 1.15 : 1,
                                        boxShadow: isActive
                                            ? `0 15px 30px rgba(0, 0, 0, 0.15)`
                                            : `0 8px 15px rgba(0, 0, 0, 0.08)`
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.5 + (index * 0.1),
                                        scale: { type: "spring", stiffness: 400, damping: 17 }
                                    }}
                                >
                                    <div className={styles.featureHeader}>
                                        <Icon
                                            className={styles.featureIcon}
                                            style={{ color: feature.color }}
                                        />
                                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                                    </div>

                                    <motion.div
                                        className={styles.featureDescription}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{
                                            opacity: isActive ? 1 : 0,
                                            height: isActive ? 'auto' : 0
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {feature.description}
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>

            {/* Features Section */}
            <motion.div
                className={styles.featuresSection}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <div className={styles.featureCard}>
                    <div className={styles.featureCardIcon}><MdBusinessCenter /></div>
                    <h3>Smart Job Matching</h3>
                    <p>AI-powered algorithms to find the perfect fit for your skills and preferences</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureCardIcon}><MdOutlineTrendingUp /></div>
                    <h3>Career Growth</h3>
                    <p>Tools and resources to help you advance your professional journey</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureCardIcon}><MdCode /></div>
                    <h3>Talent Discovery</h3>
                    <p>Find top industry talent to join your innovative team</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;