import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EmailVerificationModal from './EmailVerificationModal';

const EmailVerificationChecker = () => {
    const { user, isAuthenticated } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Only show if logged in, has user object, and 'is_verified' is false
        // Note: Check backend user object field name carefully. Typically is_verified or email_verified_at
        if (isAuthenticated && user) {
            // Ensure is_verified is properly converted to boolean
            const isVerified = user.is_verified === true || user.is_verified === 'true' || user.is_verified === 1 || user.is_verified === '1';

            if (!isVerified) {
                setShowModal(true);
            } else {
                setShowModal(false);
            }
        } else {
            setShowModal(false);
        }
    }, [isAuthenticated, user]);

    // If user becomes verified (triggered by handleVerify inside Modal which calls verifyEmail context method), 
    // the user object in context should update, causing this effect to re-run and close the modal.

    return (
        <EmailVerificationModal
            isOpen={showModal}
        // No onClose provided because this logic forces it to stay open until verified or logged out
        />
    );
};

export default EmailVerificationChecker;
