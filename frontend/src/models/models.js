/**
 * ==================== AUTH ====================
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email - Email пользователя
 * @property {string} password - Пароль
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [phone]
 * @property {'Admin'|'Deputy'|'Staff'} [role]
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} accessToken - JWT токен доступа
 * @property {string} refreshToken - Токен для обновления сессии
 * @property {number} expiresIn - Время жизни токена в секундах
 */

/**
 * @typedef {Object} RefreshPayload
 * @property {string} token - Refresh токен
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status - HTTP статус ошибки
 * @property {string} title - Заголовок ошибки
 * @property {string} [detail] - Подробное описание
 * @property {Record<string, string[]>} [errors] - Ошибки валидации по полям
 */

/**
 * ==================== ПОЛЬЗОВАТЕЛИ ====================
 */

/**
 * @typedef {Object} User
 * @property {string} id - GUID пользователя
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [homePhone]
 * @property {string} [workPhone]
 * @property {string} [address]
 * @property {'Admin'|'Deputy'|'Staff'|'Citizen'} role
 * @property {boolean} isBlocked
 * @property {string} createdAt
 * @property {string} [lastLoginAt]
 */

/**
 * @typedef {Object} UserProfile
 * @property {User} user
 * @property {Array<CommitteeMembership>} committeeHistory
 * @property {number} totalSessionsAttended
 * @property {number} initiativesCount
 */

/**
 * ==================== КОМИССИИ ====================
 */

/**
 * @typedef {'Active'|'Archived'|'Suspended'} CommitteeMembershipStatus
 */

/**
 * @typedef {Object} Committee
 * @property {string} id
 * @property {string} name
 * @property {string} specialization - "Образование", "ЖКХ", "Бюджет" и т.д.
 * @property {string} [description]
 * @property {boolean} isArchived
 * @property {string} [archivedAt]
 */

/**
 * @typedef {Object} CommitteeMembership
 * @property {string} id
 * @property {string} userId
 * @property {string} userName - "FirstName LastName"
 * @property {string} committeeId
 * @property {CommitteeMembershipStatus} status
 * @property {boolean} isChairman
 * @property {string} appointedAt
 * @property {string | null} dismissedAt
 */

/**
 * @typedef {Object} CommitteeDetails
 * @property {Committee} committee
 * @property {Array<CommitteeMembership>} currentMembers
 * @property {Array<CommitteeMembership>} history - Записи за последние 10 лет
 * @property {CommitteeMembership | null} currentChairman
 */

/**
 * @typedef {Object} CreateCommitteePayload
 * @property {string} name
 * @property {string} specialization
 * @property {string} [description]
 * @property {string} chairmanUserId - ID пользователя, который станет первым председателем
 */

/**
 * @typedef {Object} UpdateCommitteePayload
 * @property {string} id
 * @property {string} name
 * @property {string} specialization
 * @property {string} [description]
 */

/**
 * ==================== ЗАСЕДАНИЯ ====================
 */

/**
 * @typedef {'Planned'|'InProgress'|'Completed'|'Cancelled'} SessionStatus
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} committeeId
 * @property {string} committeeName
 * @property {string} scheduledAt - ISO 8601
 * @property {string} location
 * @property {string} agenda
 * @property {SessionStatus} status
 * @property {Array<string>} attendeeIds - IDs присутствующих депутатов
 * @property {Array<string>} organizerIds - IDs сотрудников, организующих заседание
 * @property {string} [protocolUrl]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} CreateSessionPayload
 * @property {string} committeeId
 * @property {string} scheduledAt
 * @property {string} location
 * @property {string} agenda
 * @property {Array<string>} [attendeeIds]
 * @property {Array<string>} [organizerIds]
 */

/**
 * @typedef {Object} AttendanceUpdatePayload
 * @property {Array<string>} attendedIds
 * @property {Array<string>} absentIds
 * @property {Record<string, string>} [absentReasons] - { userId: "уважительная причина" }
 */

/**
 * ==================== ИНИЦИАТИВЫ ====================
 */

/**
 * @typedef {'Draft'|'PendingReview'|'Queued'|'InSession'|'Approved'|'Rejected'|'Published'} InitiativeStatus
 */

/**
 * @typedef {Object} Initiative
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} authorId
 * @property {string} authorName
 * @property {string} targetCommissionId
 * @property {InitiativeStatus} status
 * @property {Array<string>} [attachmentUrls]
 * @property {string} createdAt
 * @property {string} [reviewedAt]
 * @property {string} [queuedAt]
 * @property {string} [votedAt]
 * @property {string} [publishedAt]
 */

/**
 * @typedef {Object} CreateInitiativePayload
 * @property {string} title
 * @property {string} description
 * @property {string} targetCommissionId
 * @property {Array<string>} [attachmentUrls]
 */

/**
 * @typedef {Object} ReviewInitiativePayload
 * @property {'approve'|'reject'} action
 * @property {string} [comment]
 */

/**
 * @typedef {'for'|'against'|'abstain'} VoteChoice
 */

/**
 * @typedef {Object} VotePayload
 * @property {string} deputyId
 * @property {VoteChoice} vote
 */

/**
 * ==================== ВЫБОРЫ ====================
 */

/**
 * @typedef {'CommissionChairman'|'PartyLeader'} ElectionType
 */

/**
 * @typedef {'Scheduled'|'InProgress'|'Finalized'|'Cancelled'} ElectionStatus
 */

/**
 * @typedef {Object} Election
 * @property {string} id
 * @property {ElectionType} type
 * @property {string} targetId - ID комиссии или партии
 * @property {string} targetName
 * @property {Array<string>} candidateIds
 * @property {Array<ElectionVote>} votes
 * @property {ElectionStatus} status
 * @property {string} votingDeadline
 * @property {string | null} winnerId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ElectionVote
 * @property {string} voterId
 * @property {string} candidateId
 * @property {string} votedAt
 */

/**
 * @typedef {Object} CreateElectionPayload
 * @property {ElectionType} type
 * @property {string} targetId
 * @property {Array<string>} candidateIds
 * @property {string} votingDeadline
 */

/**
 * ==================== ОТЧЁТЫ ====================
 */

/**
 * @typedef {Object} AttendanceReportEntry
 * @property {string} userId
 * @property {string} userName
 * @property {number} totalSessions - Всего заседаний за период
 * @property {number} attendedSessions - Посещено
 * @property {number} missedSessions - Пропущено
 * @property {number} attendanceRate - Процент посещаемости (0-100)
 */

/**
 * @typedef {Object} SessionCountReportEntry
 * @property {string} committeeId
 * @property {string} committeeName
 * @property {number} sessionsCount - Количество заседаний за период
 */

/**
 * ==================== ОБЩИЕ ТИПЫ ====================
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {Array<T>} items
 * @property {number} totalCount
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} EndpointMap
 * @property {string} LOGIN
 * @property {string} REGISTER
 * @property {string} REFRESH
 * @property {string} LOGOUT
 */

/**
 * @typedef {Object} CommitteeEndpointMap
 * @property {string} BASE
 * @property {function(string): string} DETAILS
 * @property {function(string): string} MEMBERS
 * @property {function(string): string} CHAIRMAN
 */