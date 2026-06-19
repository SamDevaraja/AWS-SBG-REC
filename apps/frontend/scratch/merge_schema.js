const fs = require('fs');
const path = require('path');

const schemaPath = 'c:/Users/Sam Devaraja/Desktop/EventRegistration/apps/backend/prisma/schema.prisma';
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Add relations to User model
const userTarget = '  crewPermissions CrewPermission[]';
const userReplacement = `  crewPermissions CrewPermission[]
  createdTasks    Task[]           @relation("TaskCreator")
  assignedTasks   Task[]           @relation("TaskAssignee")
  reviewAssignedTasks Task[]       @relation("TaskReviewAssignee")
  comments        Comment[]
  progressUpdates ProgressUpdate[]
  activityLogs    ActivityLog[]
  workUpdates     WorkUpdate[]
  reviewDecisions ReviewDecision[]`;

if (content.includes(userTarget) && !content.includes('createdTasks    Task[]')) {
  content = content.replace(userTarget, userReplacement);
  console.log('User relations added.');
} else {
  console.log('User relations already exist or target not found.');
}

// 2. Append new models at the bottom
const modelsToAppend = `

enum TaskCategory {
  pre_event
  during_event
  post_event
}

enum Priority {
  low
  medium
  high
  critical
}

enum TaskStatus {
  not_assigned
  assigned
  yet_to_start
  in_progress
  under_review
  completed
  blocked
}

enum ActivityAction {
  created
  assigned
  reassigned
  status_updated
  progress_updated
  comment_added
  comment_deleted
  deleted
  work_submitted
  review_approved
  review_changes_requested
  archived
  permanently_deleted
  attachment_added
}

model Task {
  id              String           @id @default(cuid())
  name            String
  category        TaskCategory
  priority        Priority
  status          TaskStatus       @default(not_assigned)
  progress        Int              @default(0)
  startDate       DateTime?
  dueDate         DateTime
  notes           String?
  completedAt     DateTime?
  archivedAt      DateTime?
  assignedAt      DateTime?
  submittedAt     DateTime?
  reviewedAt      DateTime?
  isDeleted       Boolean          @default(false)
  deletedAt       DateTime?
  reviewAssignedToId String?
  reviewAssignedAt   DateTime?
 
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  createdById     String
  createdBy       User             @relation("TaskCreator", fields: [createdById], references: [id])

  assignedToId    String?
  assignedTo      User?            @relation("TaskAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)

  reviewAssignedTo User?           @relation("TaskReviewAssignee", fields: [reviewAssignedToId], references: [id], onDelete: SetNull)

  comments        Comment[]
  progressUpdates ProgressUpdate[]
  activityLogs    ActivityLog[]
  workUpdates     WorkUpdate[]
  reviewDecisions ReviewDecision[]

  @@index([isDeleted])
  @@index([name])
  @@index([createdById])
  @@index([assignedToId])
  @@index([reviewAssignedToId])
  @@index([isDeleted, status, dueDate])
  @@index([isDeleted, assignedToId, status])
  @@index([isDeleted, archivedAt, status])
  @@index([isDeleted, submittedAt])
  @@index([priority])
  @@map("tasks")
}

model Comment {
  id              String           @id @default(cuid())
  taskId          String
  task            Task             @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  message         String           @db.Text
  createdAt       DateTime         @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([createdAt])
  @@map("comments")
}

model ProgressUpdate {
  id              String           @id @default(cuid())
  taskId          String
  task            Task             @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  comment         String?          @db.Text
  percentage      Int              @default(0)
  createdAt       DateTime         @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([createdAt])
  @@map("progress_updates")
}

model ActivityLog {
  id              String           @id @default(cuid())
  taskId          String
  task            Task             @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  action          ActivityAction
  metadata        Json?            
  createdAt       DateTime         @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([createdAt])
  @@map("activity_logs")
}

enum ReviewDecisionType {
  approved
  changes_requested
}

model WorkUpdate {
  id              String           @id @default(cuid())
  taskId          String
  task            Task             @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  description     String           @db.Text
  progress        Int
  revisionNumber  Int              @default(1)
  createdAt       DateTime         @default(now())

  attachments     WorkAttachment[]
  reviewDecisions ReviewDecision[]

  @@index([taskId])
  @@index([userId])
  @@index([taskId, createdAt])
  @@map("work_updates")
}

model WorkAttachment {
  id           String     @id @default(cuid())
  workUpdateId String
  workUpdate   WorkUpdate @relation(fields: [workUpdateId], references: [id], onDelete: Cascade)
  fileName     String
  fileUrl      String
  fileType     String
  fileSize     Int
  createdAt    DateTime   @default(now())

  @@index([workUpdateId])
  @@map("work_attachments")
}

model ReviewDecision {
  id           String             @id @default(cuid())
  taskId       String
  task         Task               @relation(fields: [taskId], references: [id], onDelete: Cascade)
  reviewerId   String
  reviewer     User               @relation(fields: [reviewerId], references: [id])
  workUpdateId String?
  workUpdate   WorkUpdate?        @relation(fields: [workUpdateId], references: [id], onDelete: SetNull)
  decision     ReviewDecisionType
  comment      String             @db.Text
  createdAt    DateTime           @default(now())

  @@index([taskId])
  @@index([reviewerId])
  @@index([taskId, createdAt])
  @@map("review_decisions")
}
`;

if (!content.includes('model Task {')) {
  content += modelsToAppend;
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('Task models successfully appended.');
} else {
  console.log('Task models already appended.');
}
