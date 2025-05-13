import React from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const textClass = theme === 'dark' ? 'text-light' : 'text-dark';
  const mutedClass = theme === 'dark' ? 'text-light-50' : 'text-muted';
  const [showModal, setShowModal] = useState<'about' | 'terms' | 'privacy' | null>(null);

  const modalContent = {
    about: {
      title: 'О сайте ProjectFlow',
      content: (
        <>
          <h5>Наша миссия</h5>
          <p>
              ProjectFlow - это краудфандинговая платформа, призванная соединить инновационных авторов с неравнодушными сторонниками.
              Мы верим в силу финансирования, осуществляемого сообществом, для воплощения новаторских идей в жизнь.
          </p>
          
          <h5>Что мы делаем</h5>
          <p>
              Мы предоставляем безопасную и прозрачную платформу, на которой авторы могут демонстрировать свои проекты и получать финансирование
              от сторонников по всему миру. Наша платформа поддерживает различные категории проектов, от технологий и искусства до
              социальных инициатив и экологических проектов.
          </p>
          
          <h5>Наши ценности</h5>
          <ul>
            <li>Прозрачность всех операций и обновлений проекта</li>
            <li>Поддержка инновационных и эффективных проектов</li>
            <li>Создание сильных сообществ на основе общих интересов</li>
            <li>Защита как создателей, так и сторонников</li>
          </ul>
        </>
      )
    },
    terms: {
      title: 'Terms of Service',
      content: (
        <>
          <h5>1. Пользовательское соглашение</h5>
          <p>
              Используя ProjectFlow, вы соглашаетесь с этими правилами и условиями. Пользователям должно быть не менее 18 лет
              для создания учетной записи или внесения вклада.
          </p>
          
          <h5>2. Руководство по проекту</h5>
          <p>
              Проекты должны:
          </p>
          <ul>
            <li>Четко описывайте цели и будьте прозрачны</li>
            <li>Не нарушать никаких законов и правил</li>
            <li>Регулярно обновляйте информацию для сторонников</li>
            <li>Предоставление обещанных вознаграждений или возврат взносов</li>
          </ul>
          
          <h5>3. Условия финансирования</h5>
          <p>
              Все взносы являются окончательными после успешного финансирования проекта. Создатели юридически обязаны
              выполнить заявленные цели проекта или вернуть деньги.
          </p>
          
          <h5>4. Плата за пользование платформой</h5>
          <p>
              ProjectFlow взимает 5-процентную комиссию с успешно профинансированных проектов, а также комиссию за обработку платежей.
          </p>
        </>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <>
          <h5>1. Информация, которую мы собираем</h5>
          <p>
              Мы собираем информацию:
          </p>
          <ul>
            <li>Информация об учетной записи (имя, электронная почта, пароль)</li>
            <li>Платежная информация (обрабатывается в безопасном режиме через наших платежных провайдеров)</li>
            <li>Данные об использовании и аналитика</li>
            <li>Коммуникативные предпочтения</li>
          </ul>
          
          <h5>2. Как мы используем вашу информацию</h5>
          <p>
              Ваша информация используется для:
          </p>
          <ul>
            <li>Обработка транзакций и ведение вашего счета</li>
            <li>Улучшить нашу платформу и пользовательский опыт</li>
            <li>Выполнять юридические обязательства</li>
          </ul>
          
          <h5>3. Безопасность данных</h5>
          <p>
              Мы применяем стандартные меры безопасности для защиты вашей личной информации.
              Все платежные данные шифруются и обрабатываются через надежных поставщиков платежей.
          </p>
          
          <h5>4. Ваши права</h5>
          <p>
              Вы имеете право:
          </p>
          <ul>
            <li>Доступ к вашим личным данным</li>
            <li>Запрашивать исправления или удаление ваших данных</li>
            <li>Отказ от маркетинговых сообщений</li>
            <li>Запросите копию ваших данных</li>
          </ul>
        </>
      )
    }
  };

  return (
    <>
      <footer className={`${theme === 'dark' ? 'bg-dark' : 'bg-light'} mt-auto py-4 border-top border-secondary`}>
        <Container>
          <Row className="justify-content-between align-items-center">
            <Col md={4}>
              <h5 className={`mb-3 ${textClass}`}>ProjectFlow</h5>
              <p className={`mb-0 ${mutedClass}`}>
                  Соединяет новаторов со сторонниками, чтобы воплотить великие идеи в жизнь.
              </p>
            </Col>
            <Col md={4} className="text-md-center py-3 py-md-0">
              <div className="d-flex gap-3 justify-content-md-center">
                <a 
                  href="#" 
                  className={mutedClass} 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('about');
                  }}
                >
                  О сайте
                </a>
                <a 
                  href="#" 
                  className={mutedClass}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('terms');
                  }}
                >
                    Условия
                </a>
                <a 
                  href="#" 
                  className={mutedClass}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('privacy');
                  }}
                >
                    Конфиденциальность
                </a>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="d-flex gap-3 justify-content-md-end">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={mutedClass}>
                  <Github size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={mutedClass}>
                  <Twitter size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={mutedClass}>
                  <Linkedin size={20} />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      <Modal
        show={showModal !== null}
        onHide={() => setShowModal(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>{showModal && modalContent[showModal].title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          {showModal && modalContent[showModal].content}
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'} onClick={() => setShowModal(null)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};