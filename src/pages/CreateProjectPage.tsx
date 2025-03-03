import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mockCategories } from '../mockData';
import { Footer } from '../components/Footer';

const projectSchema = Yup.object().shape({
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must be less than 100 characters')
        .required('Title is required'),
    description: Yup.string()
        .min(50, 'Description must be at least 50 characters')
        .required('Description is required'),
    category: Yup.string()
        .required('Category is required'),
    goalAmount: Yup.number()
        .min(100, 'Goal must be at least $100')
        .required('Funding goal is required'),
    endDate: Yup.date()
        .min(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'End date must be at least 1 week from now')
        .required('End date is required')
});

export const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: File[] = [];
        const newPreviewUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                newFiles.push(file);
                newPreviewUrls.push(URL.createObjectURL(file));
            }
        }

        setImageFiles([...imageFiles, ...newFiles]);
        setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    };

    const removeImage = (index: number) => {
        const newFiles = [...imageFiles];
        const newPreviewUrls = [...imagePreviewUrls];

        newFiles.splice(index, 1);
        newPreviewUrls.splice(index, 1);

        setImageFiles(newFiles);
        setImagePreviewUrls(newPreviewUrls);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <main className="flex-grow-1">
                <Container className="py-5">
                    <h1 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Create New Project</h1>

                    <Formik
                        initialValues={{
                            title: '',
                            description: '',
                            category: '',
                            goalAmount: '',
                            endDate: '',
                            videoUrl: ''
                        }}
                        validationSchema={projectSchema}
                        onSubmit={async (values, { setSubmitting, setStatus }) => {
                            try {
                                // Здесь должен быть код отправки формы
                                console.log('Form values:', values);
                                console.log('Images:', imageFiles);

                                // Simulate API call
                                await new Promise(resolve => setTimeout(resolve, 1000));

                                navigate('/profile');
                            } catch (error) {
                                // Добавляем использование ошибки
                                const message = error instanceof Error ? error.message : 'Failed to create project';
                                setStatus(`${message}. Please try again.`);
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              status,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              isSubmitting
                          }) => (
                            <Form onSubmit={handleSubmit}>
                                {status && <Alert variant="danger">{status}</Alert>}

                                <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                                    <Card.Body>
                                        <h5 className="mb-3">Basic Information</h5>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Project Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={values.title}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={touched.title && !!errors.title}
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.title}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Select
                                                name="category"
                                                value={values.category}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={touched.category && !!errors.category}
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            >
                                                <option value="">Select a category</option>
                                                {mockCategories.map(category => (
                                                    <option key={category.id} value={category.name}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.category}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Project Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="description"
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={touched.description && !!errors.description}
                                                placeholder="Describe your project in detail..."
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.description}
                                            </Form.Control.Feedback>
                                            <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                                Minimum 50 characters. Be detailed about what you're creating and why it matters.
                                            </Form.Text>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>

                                <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                                    <Card.Body>
                                        <h5 className="mb-3">Funding Details</h5>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Funding Goal ($)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="goalAmount"
                                                value={values.goalAmount}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={touched.goalAmount && !!errors.goalAmount}
                                                min="100"
                                                step="1"
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.goalAmount}
                                            </Form.Control.Feedback>
                                            <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                                Minimum $100. Set a realistic goal that covers your project needs.
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Campaign End Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="endDate"
                                                value={values.endDate}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={touched.endDate && !!errors.endDate}
                                                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.endDate}
                                            </Form.Control.Feedback>
                                            <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                                Must be at least 1 week from today.
                                            </Form.Text>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>

                                <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                                    <Card.Body>
                                        <h5 className="mb-3">Media</h5>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Project Images</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            />
                                            <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                                Upload high-quality images that showcase your project. You can upload multiple images.
                                            </Form.Text>
                                        </Form.Group>

                                        {imagePreviewUrls.length > 0 && (
                                            <div className="mb-4">
                                                <p className="mb-2">Image Previews:</p>
                                                <Row xs={2} md={3} lg={4} className="g-2">
                                                    {imagePreviewUrls.map((url, index) => (
                                                        <Col key={index}>
                                                            <div className="position-relative">
                                                                <img
                                                                    src={url}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="img-thumbnail"
                                                                    style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                                                                />
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="position-absolute top-0 end-0 m-1"
                                                                    onClick={() => removeImage(index)}
                                                                >
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        )}

                                        <Form.Group className="mb-3">
                                            <Form.Label>Video URL (Optional)</Form.Label>
                                            <Form.Control
                                                type="url"
                                                name="videoUrl"
                                                value={values.videoUrl}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="e.g., YouTube or Vimeo URL"
                                                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                            />
                                            <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                                Add a video link to better showcase your project.
                                            </Form.Text>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>

                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                                        onClick={() => navigate('/')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting || imageFiles.length === 0}
                                    >
                                        {isSubmitting ? 'Creating Project...' : 'Create Project'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Container>
            </main>
            <Footer />
        </div>
    );
};