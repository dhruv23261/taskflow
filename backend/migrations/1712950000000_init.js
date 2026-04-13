/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create ENUMs
  pgm.createType('task_status', ['todo', 'in_progress', 'done']);
  pgm.createType('task_priority', ['low', 'medium', 'high']);

  // Create Users Table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Create Projects Table
  pgm.createTable('projects', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(200)', notNull: true },
    description: { type: 'text' },
    owner_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('projects', 'owner_id');

  // Create Tasks Table
  pgm.createTable('tasks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    title: { type: 'varchar(300)', notNull: true },
    description: { type: 'text' },
    status: { type: 'task_status', notNull: true, default: 'todo' },
    priority: { type: 'task_priority', notNull: true, default: 'medium' },
    project_id: {
      type: 'uuid',
      notNull: true,
      references: '"projects"',
      onDelete: 'CASCADE',
    },
    assignee_id: {
      type: 'uuid',
      references: '"users"',
      onDelete: 'SET NULL',
    },
    due_date: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('tasks', 'project_id');
  pgm.createIndex('tasks', 'assignee_id');
};

exports.down = pgm => {
  pgm.dropTable('tasks');
  pgm.dropTable('projects');
  pgm.dropTable('users');
  pgm.dropType('task_priority');
  pgm.dropType('task_status');
};
