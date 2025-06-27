# Railway Database Types

Railway supports several database types that you can deploy as services in your projects:

## Supported Database Types

### 1. PostgreSQL

- **Type**: Relational Database
- **Use Cases**: Web applications, analytics, complex queries
- **Features**: ACID compliance, JSON support, advanced indexing
- **Default Port**: 5432
- **Connection**: Uses standard PostgreSQL connection strings

### 2. MySQL

- **Type**: Relational Database
- **Use Cases**: Web applications, e-commerce, content management
- **Features**: High performance, replication, clustering
- **Default Port**: 3306
- **Connection**: Uses standard MySQL connection strings

### 3. MongoDB

- **Type**: Document Database (NoSQL)
- **Use Cases**: Content management, real-time analytics, IoT
- **Features**: Flexible schema, horizontal scaling, aggregation framework
- **Default Port**: 27017
- **Connection**: Uses MongoDB connection strings

### 4. Redis

- **Type**: In-Memory Data Store
- **Use Cases**: Caching, session storage, real-time analytics
- **Features**: High performance, pub/sub, data structures
- **Default Port**: 6379
- **Connection**: Uses Redis connection strings

## Database Service Configuration

### Environment Variables

Railway automatically provides connection details via environment variables:

```bash
# PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=host
PGPORT=port
PGUSER=username
PGPASSWORD=password
PGDATABASE=database

# MySQL
DATABASE_URL=mysql://username:password@host:port/database
MYSQL_HOST=host
MYSQL_PORT=port
MYSQL_USER=username
MYSQL_PASSWORD=password
MYSQL_DATABASE=database

# MongoDB
DATABASE_URL=mongodb://username:password@host:port/database
MONGO_HOST=host
MONGO_PORT=port
MONGO_USER=username
MONGO_PASSWORD=password
MONGO_DATABASE=database

# Redis
REDIS_URL=redis://username:password@host:port
REDIS_HOST=host
REDIS_PORT=port
REDIS_PASSWORD=password
```

## Common Railway CLI Commands

### Listing Services

```bash
railway list                    # List all projects
railway status                 # Show current project status
railway service                # List services in current project
```

### Database Operations

```bash
railway connect postgres       # Connect to PostgreSQL
railway connect mysql          # Connect to MySQL
railway connect mongodb        # Connect to MongoDB
railway connect redis          # Connect to Redis
```

### Variables and Configuration

```bash
railway variables              # Show environment variables
railway logs                   # View service logs
railway domain                 # Manage domains
```

## Database Templates

Railway provides pre-configured templates for quick deployment:

1. **PostgreSQL Template**

   - Pre-configured PostgreSQL 15
   - Automatic backups
   - Connection pooling ready

2. **MySQL Template**

   - Pre-configured MySQL 8.0
   - Optimized for web applications
   - Replication ready

3. **MongoDB Template**

   - Pre-configured MongoDB 6.0
   - Replica set configuration
   - Atlas compatibility

4. **Redis Template**
   - Pre-configured Redis 7.0
   - Persistence enabled
   - Memory optimization

## Best Practices

### Security

- Use environment variables for connection strings
- Enable SSL/TLS connections
- Implement proper access controls
- Regular security updates

### Performance

- Monitor database metrics
- Implement connection pooling
- Use appropriate indexing
- Regular maintenance tasks

### Backup and Recovery

- Enable automatic backups
- Test recovery procedures
- Document backup schedules
- Store backups securely
