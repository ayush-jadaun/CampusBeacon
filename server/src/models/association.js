import sequelize from "../db/db.js";
import User from "./user.model.js";
import BuyAndSell from "./buyandsell.model.js";
import LostAndFound from "./lostandfound.model.js";
import { Club } from "./clubs.model.js";
import { Event } from "./events.model.js";
import { Coordinator } from "./coordinators.model.js";
import { EventCoordinator } from "./eventcoordinator.model.js";
import { EventRegistration } from "./eventRegistration.model.js";
import { Subject } from "./subject.model.js"; // You already had this
import {
  Menu,
  Hostel,
  Official,
  Complaint,
  HostelNotification,
} from "./hostels.model.js";
import { Branch, Year, StudyMaterial } from "./resources.model.js";
import Rides from "./ride.model.js";
import RideParticipant from "./rideParticipant.model.js";
import { Role, UserRole } from "./role.model.js";
import { Message, Channel, ChannelMember } from "./chat.model.js";
import UserSubject from "./user_subject.model.js";
import AttendanceRecord from "./attendance_record.model.js";

export const initializeAssociations = () => {
  // User - Roles associations (many-to-many)
  User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id" });
  Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id" });

  // User - LostAndFound associations
  User.hasMany(LostAndFound, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  LostAndFound.belongsTo(User, { foreignKey: "userId" });

  // User - BuyAndSell associations
  User.hasMany(BuyAndSell, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  BuyAndSell.belongsTo(User, { foreignKey: "userId", as: "users" }); // Note: 'users' might be confusing alias, maybe 'seller' or 'owner'?

  // Hostel - Menu associations
  Hostel.hasMany(Menu, { foreignKey: "hostel_id", onDelete: "CASCADE" });
  Menu.belongsTo(Hostel, { foreignKey: "hostel_id" });

  // Hostel - Official associations
  Hostel.hasMany(Official, { foreignKey: "hostel_id" });
  Official.belongsTo(Hostel, { foreignKey: "hostel_id" });

  // Hostel - Complaint associations
  Hostel.hasMany(Complaint, { foreignKey: "hostel_id" });
  Complaint.belongsTo(Hostel, { foreignKey: "hostel_id" });

  // Official - Complaint associations
  Official.hasMany(Complaint, { foreignKey: "official_id" });
  Complaint.belongsTo(Official, { foreignKey: "official_id" });

  // Hostel - Notification associations
  Hostel.hasMany(HostelNotification, { foreignKey: "hostel_id" });
  HostelNotification.belongsTo(Hostel, { foreignKey: "hostel_id" });

  // Resources associations (Study Material)
  Branch.hasMany(Year, { foreignKey: "branch_id" });
  Year.belongsTo(Branch, { foreignKey: "branch_id" });

  Branch.hasMany(StudyMaterial, { foreignKey: "branch_id" });
  Year.hasMany(StudyMaterial, { foreignKey: "year_id" });
  Subject.hasMany(StudyMaterial, { foreignKey: "subject_id" }); // A Subject can be part of many StudyMaterials

  StudyMaterial.belongsTo(Branch, { foreignKey: "branch_id" });
  StudyMaterial.belongsTo(Year, { foreignKey: "year_id" });
  StudyMaterial.belongsTo(Subject, { foreignKey: "subject_id" }); // A StudyMaterial belongs to one Subject

  // User - Rides associations
  User.hasMany(Rides, {
    foreignKey: "creatorId",
    as: "rides",
    onDelete: "CASCADE",
  });
  Rides.belongsTo(User, {
    foreignKey: "creatorId",
    as: "creator",
  });
  Rides.hasMany(RideParticipant, { foreignKey: "rideId", as: "participants" });
  RideParticipant.belongsTo(Rides, { foreignKey: "rideId" });

  // Chat associations
  User.hasMany(Message, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Message.belongsTo(User, { foreignKey: "userId" });

  Channel.hasMany(Message, {
    foreignKey: "channelId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Message.belongsTo(Channel, { foreignKey: "channelId" });

  User.belongsToMany(Channel, {
    through: ChannelMember,
    foreignKey: "userId",
    onDelete: "CASCADE",
  });
  Channel.belongsToMany(User, {
    through: ChannelMember,
    foreignKey: "channelId",
    onDelete: "CASCADE",
  });
Event.hasOne(Channel, {
  foreignKey: "event_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Channel.belongsTo(Event, {
  foreignKey: "event_id",
});

  // Channel creator association
  Channel.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
  });
  User.hasMany(Channel, {
    foreignKey: "createdBy",
    as: "createdChannels",
  });

  // Clubs/Events/Coordinators associations
  Club.hasMany(Event, { foreignKey: "club_id" });
  Event.belongsTo(Club, { foreignKey: "club_id" });

  Club.hasMany(Coordinator, { foreignKey: "club_id" });
  Coordinator.belongsTo(Club, { foreignKey: "club_id" });

  Event.belongsToMany(Coordinator, {
    through: EventCoordinator,
    foreignKey: "event_id",
  });
  Coordinator.belongsToMany(Event, {
    through: EventCoordinator,
    foreignKey: "coordinator_id",
  });

  // Event registrations
  Event.hasMany(EventRegistration, {
    foreignKey: "event_id",
    as: "registrations",
    onDelete: "CASCADE",
  });
  EventRegistration.belongsTo(Event, { foreignKey: "event_id" });
  User.hasMany(EventRegistration, {
    foreignKey: "user_id",
    as: "eventRegistrations",
    onDelete: "CASCADE",
  });
  EventRegistration.belongsTo(User, { foreignKey: "user_id" });

  // ================================================
  // START: Attendance Tracker Associations
  // ================================================

  // --- User <-> Subject (Many-to-Many Enrollment) ---
  User.belongsToMany(Subject, {
    through: UserSubject,
    foreignKey: "userId",
    otherKey: "subjectId",
    as: "enrolledSubjects", // User.getEnrolledSubjects()
  });
  Subject.belongsToMany(User, {
    through: UserSubject,
    foreignKey: "subjectId",
    otherKey: "userId",
    as: "enrolledUsers", // Subject.getEnrolledUsers()
  });

  // Optional: Direct associations with the join table
  User.hasMany(UserSubject, { foreignKey: "userId", as: "enrollments" });
  UserSubject.belongsTo(User, { foreignKey: "userId" });
  Subject.hasMany(UserSubject, { foreignKey: "subjectId", as: "enrollments" });
  UserSubject.belongsTo(Subject, { foreignKey: "subjectId" });

  // --- User <-> AttendanceRecord (One-to-Many) ---
  User.hasMany(AttendanceRecord, {
    foreignKey: "userId",
    as: "attendanceRecords", // User.getAttendanceRecords()
    onDelete: "CASCADE",
  });
  AttendanceRecord.belongsTo(User, {
    foreignKey: "userId",
    as: "student", // AttendanceRecord.getStudent()
  });

  // --- Subject <-> AttendanceRecord (One-to-Many) ---
  Subject.hasMany(AttendanceRecord, {
    foreignKey: "subjectId",
    as: "attendanceRecords", // Subject.getAttendanceRecords()
    onDelete: "CASCADE",
  });
  AttendanceRecord.belongsTo(Subject, {
    foreignKey: "subjectId",
    as: "subject", // AttendanceRecord.getSubject()
  });

  // ================================================
  // END: Attendance Tracker Associations
  // ================================================
};

export {
  User,
  LostAndFound,
  BuyAndSell,
  Subject,
  Rides,
  RideParticipant,
  Role,
  UserRole,
  Message,
  Channel,
  ChannelMember,
  Coordinator,
  EventCoordinator,
  EventRegistration,
  Club,
  Event,
  Hostel, 
  Menu,
  Official,
  Complaint,
  HostelNotification,
  Branch,
  Year,
  StudyMaterial,
  UserSubject,
  AttendanceRecord,
};
