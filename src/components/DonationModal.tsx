import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../context/ThemeContext';

interface DonationModalProps {
  show: boolean;
  onHide: () => void;
  projectTitle: string;
  onDonate: (amount: number) => Promise<void>;
}

const donationSchema = Yup.object().shape({
  amount: Yup.number()
    .min(1, 'Minimum donation is $1')
    .required('Amount is required'),
});

export const DonationModal: React.FC<DonationModalProps> = ({
  show,
  onHide,
  projectTitle,
  onDonate,
}) => {
  const { theme } = useTheme();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
        <Modal.Title>Support "{projectTitle}"</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{ amount: '' }}
        validationSchema={donationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await onDonate(Number(values.amount));
            onHide();
          } catch (error) {
            console.error('Donation failed:', error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <Form.Group className="mb-3">
                <Form.Label>Donation Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.amount && !!errors.amount}
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
              <Button variant={theme === 'dark' ? 'outline-light' : 'secondary'} onClick={onHide}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Donate'}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};