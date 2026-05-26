### JDBC Notes 🚀

#### What is JDBC?

JDBC stands for:

```text
Java Database Connectivity
```

It is used to connect Java applications with databases like:

- PostgreSQL
- MySQL
- Oracle
- MongoDB (via drivers)

---

#### JDBC Architecture

```text
Java Application
       ↓
    JDBC API
       ↓
   JDBC Driver
       ↓
   PostgreSQL
```

---

#### JDBC Workflow

```text
1. Create Connection
2. Create Statement / PreparedStatement
3. Execute SQL Query
4. Process ResultSet
5. Close Connection
```

---

### PostgreSQL Docker Setup

#### Pull PostgreSQL Image

```bash
docker pull postgres
```

---

#### Run PostgreSQL Container

```bash
docker run --name postgres-db \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_USER=postgres \
-e POSTGRES_DB=jdbc_demo \
-p 5432:5432 \
-d postgres
```

---

#### Enter PostgreSQL Shell

```bash
docker exec -it postgres-db psql -U postgres
```

#### Connect Database

```sql
\c jdbc_demo
```

#### Show Databases

```sql
\l
```

#### Show Tables

```sql
\dt
```

### Create Students Table

```sql
CREATE TABLE students(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);
```

---

### Maven Dependency

Add PostgreSQL JDBC Driver inside `pom.xml`

```xml
<dependencies>

    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.7.3</version>
    </dependency>

</dependencies>
```

---

### JDBC Core Interfaces

| Interface         | Purpose                  |
| ----------------- | ------------------------ |
| DriverManager     | Creates DB connection    |
| Connection        | Represents DB connection |
| Statement         | Executes SQL queries     |
| PreparedStatement | Safer precompiled SQL    |
| ResultSet         | Stores query result      |

---

### Database Connection Example

```java
import java.sql.Connection;
import java.sql.DriverManager;

public class Main {

    public static void main(String[] args) {

        String url =
                "jdbc:postgresql://localhost:5432/jdbc_demo";

        String username = "postgres";
        String password = "postgres";

        try {

            Connection con =
                    DriverManager.getConnection(
                            url,
                            username,
                            password
                    );

            System.out.println("Connected Successfully!");

            con.close();

        } catch(Exception e){
            e.printStackTrace();
        }
    }
}
```

---

### Understanding JDBC URL

```java
jdbc:postgresql://localhost:5432/jdbc_demo
```

| Part            | Meaning         |
| --------------- | --------------- |
| jdbc:postgresql | Database type   |
| localhost       | Server          |
| 5432            | PostgreSQL Port |
| jdbc_demo       | Database name   |

---

### Statement vs PreparedStatement

| Statement    | PreparedStatement      |
| ------------ | ---------------------- |
| Dynamic SQL  | Precompiled SQL        |
| Not secure   | Prevents SQL Injection |
| Slower       | Faster                 |
| Not reusable | Reusable               |

---

### Why PreparedStatement?

PreparedStatement:

- prevents SQL injection
- cleaner syntax
- faster execution
- industry standard

---

### CRUD Operations Using PreparedStatement

```java
import java.sql.*;

public class Main {

    public static void main(String[] args) {

        String url =
                "jdbc:postgresql://localhost:5432/jdbc_demo";

        String username = "postgres";
        String password = "postgres";

        try {

            // Establish database connection
            Connection con =
                    DriverManager.getConnection(
                            url,
                            username,
                            password
                    );

            System.out.println(
                    "Connected Successfully!"
            );

            // ---------------------------------------------------
            // INSERT OPERATION
            // ---------------------------------------------------

            String insertQuery =
                    "INSERT INTO students(name, email) VALUES(?, ?)";

            PreparedStatement insertSt =
                    con.prepareStatement(insertQuery);

            insertSt.setString(1, "rushi");
            insertSt.setString(2, "rushi@gmail.com");

            int insertedRows =
                    insertSt.executeUpdate();

            System.out.println(
                    insertedRows + " row inserted"
            );

            // ---------------------------------------------------
            // SELECT OPERATION
            // ---------------------------------------------------

            String selectQuery =
                    "SELECT * FROM students";

            PreparedStatement selectSt =
                    con.prepareStatement(selectQuery);

            ResultSet rs =
                    selectSt.executeQuery();

            while(rs.next()){

                int id =
                        rs.getInt("id");

                String name =
                        rs.getString("name");

                String email =
                        rs.getString("email");

                System.out.println(
                        id + " " +
                        name + " " +
                        email
                );
            }

            // ---------------------------------------------------
            // UPDATE OPERATION
            // ---------------------------------------------------

            String updateQuery =
                    "UPDATE students SET name=? WHERE id=?";

            PreparedStatement updateSt =
                    con.prepareStatement(updateQuery);

            updateSt.setString(1, "Rushikesh");
            updateSt.setInt(2, 1);

            int updatedRows =
                    updateSt.executeUpdate();

            System.out.println(
                    updatedRows + " row updated"
            );

            // ---------------------------------------------------
            // DELETE OPERATION
            // ---------------------------------------------------

            String deleteQuery =
                    "DELETE FROM students WHERE id=?";

            PreparedStatement deleteSt =
                    con.prepareStatement(deleteQuery);

            deleteSt.setInt(1, 1);

            int deletedRows =
                    deleteSt.executeUpdate();

            System.out.println(
                    deletedRows + " row deleted"
            );

            con.close();

        } catch(Exception e){
            e.printStackTrace();
        }
    }
}
```

---

### Important Methods

### executeUpdate()

Used for:

- INSERT
- UPDATE
- DELETE

Returns:

```text
affected rows count
```

---

### executeQuery()

Used for:

- SELECT

Returns:

```text
ResultSet
```

---

### ResultSet

Think of ResultSet as:

```text
table-like object
```

---

### ResultSet Methods

| Method      | Purpose                |
| ----------- | ---------------------- |
| rs.next()   | Move cursor row by row |
| getInt()    | Fetch integer value    |
| getString() | Fetch string value     |

---

### Placeholders in PreparedStatement

```java
VALUES(?, ?)
```

`?` are placeholders.

Example:

```java
ps.setString(1, "Rushikesh");
```

means:

```text
replace first ? with Rushikesh
```

---

### SQL Injection

BAD Practice:

```java
String query =
"INSERT INTO users VALUES('" + name + "')";
```

Can cause:

```text
SQL Injection Attack
```

---

### Safe Way

```java
PreparedStatement ps =
con.prepareStatement(
"INSERT INTO users(name) VALUES(?)"
);
```

---

### try-with-resources (Best Practice)

Production-level JDBC code uses:

```java
try(
    Connection con =
        DriverManager.getConnection(url,user,password);

    PreparedStatement ps =
        con.prepareStatement(query);
){

}
catch(Exception e){
    e.printStackTrace();
}
```

Java automatically closes:

- Connection
- Statement
- ResultSet

---

### Important JDBC Interview Questions

### Difference:

### executeQuery vs executeUpdate

| Method          | Used For             |
| --------------- | -------------------- |
| executeQuery()  | SELECT               |
| executeUpdate() | INSERT/UPDATE/DELETE |

---

### Difference:

### Statement vs PreparedStatement

| Statement   | PreparedStatement |
| ----------- | ----------------- |
| Dynamic SQL | Precompiled SQL   |
| Less secure | More secure       |
| Slower      | Faster            |

---

### What Happens Internally?

```text
Spring Boot
    ↓
Hibernate/JPA
    ↓
JDBC
    ↓
SQL Query
    ↓
Database
```
