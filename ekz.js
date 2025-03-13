// 1. Базовый класс (инкапсуляция + методы доступа)
class BaseClass {
    // Приватные свойства (начинаются с #)
    #property1;
    #property2;

    constructor() {
        // Инициализация свойств по умолчанию
        this.#property1 = "";   // Для строк
        this.#property2 = 0;    // Для чисел
    }

    // Метод для установки значений
    setProperties(prop1, prop2) {
        this.#property1 = prop1;
        this.#property2 = prop2;
    }

    // Метод для вывода значений
    displayProperties() {
        console.log("Свойство 1: ${this.#property1}");
        console.log("Свойство 2: ${this.#property2}");
    }
}

// 2. Производный класс (наследование)
class DerivedClass extends BaseClass {
    #newProperty; // Дополнительное приватное свойство

    constructor(prop1 = "", prop2 = 0, newProp = 0) {
        super(); // Вызов конструктора родителя
        super.setProperties(prop1, prop2); // Установка унаследованных свойств
        this.#newProperty = newProp;
    }

    // Метод для ввода данных (пример для браузера)
    inputProperties() {
        const prop1 = prompt("Введите свойство 1:");
        const prop2 = parseInt(prompt("Введите свойство 2:"));
        const newProp = parseInt(prompt("Введите новое свойство:"));

        this.setProperties(prop1, prop2); // Используем метод родителя
        this.#newProperty = newProp;
    }

    // Переопределение метода вывода
    displayProperties() {
        super.displayProperties(); // Вызов метода родителя
        console.log("Новое свойство: ${this.#newProperty}");
    }
}

// 3. Пример использования
const baseObj = new BaseClass();
baseObj.setProperties("Значение 1", 100);
baseObj.displayProperties();

const derivedObj = new DerivedClass();
derivedObj.inputProperties(); // Ввод через диалоговые окна
derivedObj.displayProperties(); // Вывод всех свойств