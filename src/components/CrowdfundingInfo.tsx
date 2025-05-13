import React from 'react';
import { Accordion } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

export const CrowdfundingInfo: React.FC = () => {
  const { theme } = useTheme();
  const darkClass = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
  
  return (
    <div className="mt-4">
      <h4 className="mb-3">Что такое краудфандинг</h4>
      <p>
        Краудфандинг - это метод привлечения капитала с помощью коллективных усилий друзей, родственников, клиентов и индивидуальных инвесторов.
        Этот подход позволяет использовать коллективные усилия большого числа людей - в основном в Интернете с помощью социальных сетей и краудфандинговых
        и использует их сети для большего охвата и воздействия.
      </p>
      
      <Accordion defaultActiveKey="0" className="mt-4">
        <Accordion.Item eventKey="0" className={darkClass}>
          <Accordion.Header>Виды краудфандинга</Accordion.Header>
          <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <ul>
              <li><strong>Вознаграждение:</strong> Вкладчики получают вознаграждение, обычно это продукт, на который выделяются средства.</li>
              <li><strong>На основе пожертвований:</strong> Вкладчики жертвуют, не ожидая ничего взамен.</li>
              <li><strong>На основе акций:</strong> Contributors receive equity or shares in the company.</li>
              <li><strong>На основе долга:</strong> С течением времени вкладчикам выплачиваются проценты.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="1" className={darkClass}>
          <Accordion.Header>Преимущества краудфандинга</Accordion.Header>
          <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <ul>
              <li><strong>Доступ к капиталу:</strong> Предоставляет финансирование для проектов, которые не могут претендовать на традиционное финансирование.</li>
              <li><strong>Проверка рынка:</strong> Проверьте, есть ли интерес к вашему продукту или услуге.</li>
              <li><strong>Маркетинговые возможности:</strong> Создает осведомленность и формирует аудиторию еще до запуска.</li>
              <li><strong>Общественное здание:</strong> Создает сообщество сторонников, которые заинтересованы в вашем успехе.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="2" className={darkClass}>
          <Accordion.Header>Советы по проведению успешных кампаний</Accordion.Header>
          <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <ol>
              <li><strong>Поставьте четкую цель:</strong> Определите, на что именно вы собираете деньги и какая сумма вам нужна.</li>
              <li><strong>Расскажите свою историю:</strong> Создайте убедительный рассказ о своем проекте и о том, почему он важен.</li>
              <li><strong>Используйте качественные носители информации:</strong> Включите высококачественные фотографии и видео, чтобы продемонстрировать свой проект.</li>
              <li><strong>Предлагайте привлекательные вознаграждения:</strong> Создайте стимулы, побуждающие людей вносить свой вклад.</li>
              <li><strong>Широко рекламируйтесь:</strong> Поделитесь своей кампанией во всех своих сетях и каналах социальных сетей.</li>
              <li><strong>Регулярно обновляйте информацию:</strong> Информируйте своих сторонников о ходе работы и основных этапах.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};