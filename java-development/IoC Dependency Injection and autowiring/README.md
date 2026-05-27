# Spring Boot - IoC, Dependency Injection and Autowiring

## 1. IoC - Inversion of Control

In normal Java, if one class needs another class, we create the object manually using `new`.

Example:

```java
Dev dev = new Dev();
dev.build();
```

This works, but object creation and object management become our responsibility.

If a project has many classes, we may need to create many objects manually. This makes the code tightly coupled and harder to manage.

Spring Boot solves this using **IoC**, which means **Inversion of Control**.

Simple meaning:

> Instead of us creating and managing objects, Spring creates and manages them for us.

Spring stores these managed objects inside the **IoC Container**, also called the **Spring Container**.

In Spring, the objects managed by the container are called **beans**.

## 2. Example Without Spring Container

Suppose we have a `Dev` class:

```java
package com.rushidev.iocproject;

public class Dev {
    public void build() {
        System.out.println("Working on Spring Boot project");
    }
}
```

If we want to use this class in `main`, we normally do this:

```java
package com.rushidev.iocproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IocProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(IocProjectApplication.class, args);

        Dev dev = new Dev();
        dev.build();
    }
}
```

Here, we created the `Dev` object manually:

```java
Dev dev = new Dev();
```

This object is not managed by Spring. It is just a normal Java object.

## 3. Creating Object Using Spring IoC Container

When we run this line:

```java
SpringApplication.run(IocProjectApplication.class, args);
```

Spring Boot starts the application and creates the Spring Container.

This method also returns an object of type `ApplicationContext`.

`ApplicationContext` is the container object. We can use it to ask Spring for beans.

Example:

```java
package com.rushidev.iocproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class IocProjectApplication {

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(IocProjectApplication.class, args);

        Dev dev = context.getBean(Dev.class);
        dev.build();
    }
}
```

But this will work only if Spring knows that it has to manage the `Dev` class.

For that, we add `@Component` on the class.

```java
package com.rushidev.iocproject;

import org.springframework.stereotype.Component;

@Component
public class Dev {
    public void build() {
        System.out.println("Working on Spring Boot project");
    }
}
```

Now Spring will create the object of `Dev` and store it inside the Spring Container.

Then we can get it using:

```java
Dev dev = context.getBean(Dev.class);
```

## 4. Dependency Injection

Dependency Injection means:

> If one class needs another class, Spring provides that required object automatically.

Example:

Suppose `Dev` needs a `Laptop`.

```java
package com.rushidev.iocproject;

import org.springframework.stereotype.Component;

@Component
public class Laptop {
    public void compile() {
        System.out.println("Compiling code");
    }
}
```

Now `Dev` depends on `Laptop`.

```java
package com.rushidev.iocproject;

import org.springframework.stereotype.Component;

@Component
public class Dev {

    private Laptop laptop;

    public Dev(Laptop laptop) {
        this.laptop = laptop;
    }

    public void build() {
        laptop.compile();
        System.out.println("Working on Spring Boot project");
    }
}
```

Here, `Laptop` is a dependency of `Dev`.

We did not write:

```java
Laptop laptop = new Laptop();
```

Spring automatically gives the `Laptop` object to `Dev`.

This is called **Dependency Injection**.

## 5. Autowiring

Autowiring is the process where Spring automatically connects one bean with another bean.

Simple meaning:

> Spring checks what object a class needs and automatically injects that object from the container.

In the previous example:

```java
public Dev(Laptop laptop) {
    this.laptop = laptop;
}
```

Spring sees that `Dev` needs a `Laptop`.

Because `Laptop` is also marked with `@Component`, Spring already has a `Laptop` bean in the container.

So Spring automatically injects the `Laptop` object into `Dev`.

This automatic connection is called **Autowiring**.

## 6. Types of Autowiring

### Constructor Injection

This is the recommended way.

```java
@Component
public class Dev {

    private final Laptop laptop;

    public Dev(Laptop laptop) {
        this.laptop = laptop;
    }

    public void build() {
        laptop.compile();
        System.out.println("Working on Spring Boot project");
    }
}
```

In modern Spring, if a class has only one constructor, `@Autowired` is optional.

Spring automatically uses that constructor.

### Field Injection

This also works, but it is not recommended for real projects.

```java
@Component
public class Dev {

    @Autowired
    private Laptop laptop;

    public void build() {
        laptop.compile();
        System.out.println("Working on Spring Boot project");
    }
}
```

Here, Spring directly injects the `Laptop` object into the field.

This is easy to write, but constructor injection is better because it makes dependencies clear and easier to test.

### Setter Injection

In setter injection, Spring injects the dependency using a setter method.

```java
@Component
public class Dev {

    private Laptop laptop;

    @Autowired
    public void setLaptop(Laptop laptop) {
        this.laptop = laptop;
    }

    public void build() {
        laptop.compile();
        System.out.println("Working on Spring Boot project");
    }
}
```

Setter injection is useful when the dependency is optional or can change later.

## 7. `@Primary` and `@Qualifier`

`@Primary` and `@Qualifier` are used when Spring finds multiple beans of the same type.

Suppose we have one interface:

```java
package com.rushidev.iocproject;

public interface Computer {
    void compile();
}
```

Now two classes implement this interface.

```java
package com.rushidev.iocproject;

import org.springframework.stereotype.Component;

@Component
public class Laptop implements Computer {
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}
```

```java
package com.rushidev.iocproject;

import org.springframework.stereotype.Component;

@Component
public class Desktop implements Computer {
    public void compile() {
        System.out.println("Compiling using Desktop");
    }
}
```

Now if `Dev` depends on `Computer`, Spring gets confused.

```java
package com.rushidev.iocproject;

import org.springframework.stereotype.Component;

@Component
public class Dev {

    private final Computer computer;

    public Dev(Computer computer) {
        this.computer = computer;
    }

    public void build() {
        computer.compile();
        System.out.println("Working on Spring Boot project");
    }
}
```

Here, Spring sees two beans of type `Computer`:

```txt
Laptop
Desktop
```

So Spring does not know which object to inject into `Dev`.

This can give an error like:

```txt
NoUniqueBeanDefinitionException
```

Simple meaning:

> Spring found more than one bean of the same type and needs help choosing one.

### `@Primary`

`@Primary` tells Spring:

> If there are multiple beans of the same type, use this bean by default.

Example:

```java
package com.rushidev.iocproject;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class Laptop implements Computer {
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}
```

Now if `Dev` asks for `Computer`, Spring will inject `Laptop` by default.

```java
public Dev(Computer computer) {
    this.computer = computer;
}
```

Because `Laptop` is marked with `@Primary`, Spring chooses `Laptop`.

### `@Qualifier`

`@Qualifier` tells Spring exactly which bean to inject.

Example:

```java
package com.rushidev.iocproject;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class Dev {

    private final Computer computer;

    public Dev(@Qualifier("desktop") Computer computer) {
        this.computer = computer;
    }

    public void build() {
        computer.compile();
        System.out.println("Working on Spring Boot project");
    }
}
```

Here, Spring will inject `Desktop`.

By default, Spring bean names are class names with the first letter lowercase.

```txt
Laptop  -> laptop
Desktop -> desktop
```

So we write:

```java
@Qualifier("desktop")
```

### `@Primary` vs `@Qualifier`

`@Primary` is the default choice.

`@Qualifier` is the specific choice.

If both are used, `@Qualifier` wins because it is more specific.

Example:

```java
@Component
@Primary
public class Laptop implements Computer {
}
```

```java
@Component
public class Desktop implements Computer {
}
```

```java
public Dev(@Qualifier("desktop") Computer computer) {
    this.computer = computer;
}
```

Here, `Laptop` is primary, but Spring will still inject `Desktop` because we used:

```java
@Qualifier("desktop")
```

Simple summary:

```txt
@Primary   = use this bean by default
@Qualifier = use this exact bean
```

Use `@Primary` when one implementation should be the common/default option.

Use `@Qualifier` when you want to manually choose a specific implementation.

## 8. Quick Summary

`IoC` means Spring controls object creation and object management.

`Spring Container` stores the objects created by Spring.

`Bean` means an object managed by Spring.

`@Component` tells Spring to create and manage the object of that class.

`ApplicationContext` is used to access the Spring Container.

`Dependency Injection` means Spring gives a required object to a class.

`Autowiring` means Spring automatically connects dependent objects.

`@Primary` tells Spring which bean to use by default when multiple beans are available.

`@Qualifier` tells Spring exactly which bean to inject.

Recommended injection style:

```java
private final Laptop laptop;

public Dev(Laptop laptop) {
    this.laptop = laptop;
}
```
