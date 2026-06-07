/**
 * @file models.js
 */



/**
 * @typedef {Object} LoginPayload
 * @property {string} email - Email пользователя
 * @property {string} password - Пароль пользователя
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} email - Email
 * @property {string} password - Пароль
 * @property {string} firstName - Имя
 * @property {string} lastName - Фамилия
 * @property {string} [middleName] - Отчество
 * @property {string} [phone] - Телефон (опционально)
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} accessToken - JWT токен доступа
 * @property {string} refreshToken - Токен для обновления сессии
 * @property {number} [expiresIn] - Время жизни токена в секундах
 */

/**
 * @typedef {Object} RefreshPayload
 * @property {string} refreshToken - Refresh токен
 */



/**
 * @typedef {'Admin'|'User'|'Deputy'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id - GUID пользователя
 * @property {string} firstName - Имя
 * @property {string} lastName - Фамилия
 * @property {string} [middleName] - Отчество
 * @property {string} email - Email
 * @property {UserRole} roleName - Роль пользователя
 * @property {string} [currentPartyName] - Название текущей партии (null если не состоит)
 * @property {Array<string>} activeCommitteeNames - Названия активных комиссий
 * @property {boolean} [isBlocked] - Заблокирован ли пользователь
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - GUID пользователя
 * @property {string} fullName - Полное имя (Фамилия Имя Отчество)
 * @property {string} email - Email
 * @property {UserRole} roleName - Роль пользователя
 * @property {string} memberSince - ISO 8601 дата начала полномочий
 * @property {string} [homePhone] - Домашний телефон
 * @property {string} [workPhone] - Служебный телефон
 * @property {string} [avatarUrl] - URL аватара
 * @property {number} ratingScore - Количество очков рейтинга
 * @property {string} [partyName] - Название текущей партии
 * @property {Array<CommitteeMembership>} commissions - Список членств в комиссиях
 * @property {PartyMembership|null} currentParty - Текущая партия
 * @property {Array<Initiative>} acceptedInitiatives - Принятые инициативы
 * @property {Array<SessionAttendance>} attendances - История посещений заседаний
 */

/**
 * @typedef {Object} UserRating
 * @property {string} userId - GUID пользователя
 * @property {string} fullName - Полное имя
 * @property {number} ratingScore - Количество очков рейтинга
 */



/**
 * @typedef {'Активен'|'Архив'|'Приостановлен'} CommitteeMembershipStatus
 */

/**
 * @typedef {Object} Committee
 * @property {string} id - GUID комиссии
 * @property {string} name - Название комиссии
 * @property {string} specialization - Специализация ("Образование", "ЖКХ" и т.д.)
 * @property {string} [description] - Описание
 * @property {number} memberCount - Количество активных участников
 * @property {string|null} chairmanName - ФИО текущего председателя
 * @property {boolean} [isArchived] - В архиве ли комиссия
 * @property {string} [archivedAt] - Дата архивации
 */

/**
 * @typedef {Object} CommitteeDetails
 * @property {string} id - GUID комиссии
 * @property {string} name - Название
 * @property {string} specialization - Специализация
 * @property {string} [description] - Описание
 * @property {string} [createdAt] - Дата создания
 * @property {Array<CommitteeMember>} currentMembers - Текущие участники
 * @property {Array<Session>} upcomingSessions - Предстоящие заседания
 * @property {Array<Initiative>} acceptedInitiatives - Принятые инициативы комиссии
 */

/**
 * @typedef {Object} CommitteeMember
 * @property {string} userId - GUID пользователя
 * @property {string} fullName - ФИО участника
 * @property {boolean} isChairman - Является ли председателем
 * @property {string} appointedAt - ISO 8601 дата назначения
 * @property {string|null} dismissedAt - ISO 8601 дата снятия (null если активен)
 */

/**
 * @typedef {Object} CommitteeMembership
 * @property {string} committeeId - GUID комиссии
 * @property {string} committeeName - Название комиссии
 * @property {string} appointedAt - ISO 8601 дата вступления
 * @property {string|null} dismissedAt - ISO 8601 дата выхода
 * @property {boolean} isChairman - Является ли председателем
 * @property {CommitteeMembershipStatus} status - Статус членства
 */

/**
 * @typedef {Object} CreateCommitteePayload
 * @property {string} name - Название
 * @property {string} specialization - Специализация
 * @property {string} [description] - Описание
 */

/**
 * @typedef {Object} UpdateCommitteePayload
 * @property {string} name - Название
 * @property {string} specialization - Специализация
 * @property {string} [description] - Описание
 */

/**
 * @typedef {Object} MembershipDto
 * @property {string} id - GUID записи
 * @property {string} userId - GUID пользователя
 * @property {string} committeeId - GUID комиссии
 * @property {string} appointedAt - Дата назначения
 * @property {boolean} isChairman - Является ли председателем
 */


/**
 * @typedef {Object} Party
 * @property {string} id - GUID партии
 * @property {string} name - Название партии
 * @property {string} [abbreviation] - Аббревиатура (например, "НИ")
 * @property {string} [ideology] - Идеология
 * @property {string} [description] - Описание
 * @property {number} memberCount - Количество участников
 */

/**
 * @typedef {Object} PartyDetails
 * @property {string} id - GUID партии
 * @property {string} name - Название
 * @property {string} [abbreviation] - Аббревиатура
 * @property {string} [ideology] - Идеология
 * @property {string} [description] - Описание
 * @property {Array<PartyMember>} members - Список участников
 */

/**
 * @typedef {Object} PartyMember
 * @property {string} userId - GUID пользователя
 * @property {string} fullName - ФИО участника
 * @property {string} [appointedAt] - Дата вступления
 * @property {string|null} [dismissedAt] - Дата выхода
 */

/**
 * @typedef {Object} PartyMembership
 * @property {string} partyId - GUID партии
 * @property {string} partyName - Название партии
 * @property {string} [abbreviation] - Аббревиатура
 * @property {string} [ideology] - Идеология
 * @property {string} appointedAt - Дата вступления
 */

/**
 * @typedef {Object} MembershipJoinDto
 * @property {string} id - GUID записи
 * @property {string} userId - GUID пользователя
 * @property {string} partyId - GUID партии
 * @property {string} appointedAt - Дата вступления
 */


/**
 * @typedef {Object} Session
 * @property {string} id - GUID заседания
 * @property {string} title - Название/номер заседания
 * @property {string} committeeId - GUID комиссии
 * @property {string} committeeName - Название комиссии
 * @property {string} heldAt - ISO 8601 дата и время проведения
 * @property {string} [location] - Место проведения
 * @property {string} [agenda] - Повестка дня
 * @property {boolean} isCompleted - Завершено ли заседание
 * @property {Array<Attendee>} [attendees] - Список участников
 */

/**
 * @typedef {Object} SessionDetail
 * @property {string} id - GUID заседания
 * @property {string} title - Название
 * @property {string} committeeId - GUID комиссии
 * @property {string} committeeName - Название комиссии
 * @property {string} heldAt - Дата и время
 * @property {string} [location] - Место
 * @property {string} [agenda] - Повестка
 * @property {boolean} isCompleted - Завершено ли
 * @property {Array<Attendee>} attendees - Участники
 */

/**
 * @typedef {Object} SessionProtocol
 * @property {string} id - GUID заседания
 * @property {string} title - Название
 * @property {string} committeeName - Название комиссии
 * @property {string} heldAt - Дата проведения
 * @property {string} [summary] - Краткое содержание
 * @property {Array<Initiative>} votedInitiatives - Инициативы, по которым голосовали
 */

/**
 * @typedef {Object} Attendee
 * @property {string} userId - GUID пользователя
 * @property {string} fullName - ФИО
 * @property {boolean} wasAttended - Присутствовал ли
 * @property {number} hearingRound - Раунд слушаний
 */

/**
 * @typedef {Object} SessionAttendance
 * @property {string} sessionId - GUID заседания
 * @property {string} sessionTitle - Название заседания
 * @property {string} committeeName - Название комиссии
 * @property {string} heldAt - ISO 8601 дата проведения
 * @property {boolean} wasAttended - Присутствовал ли
 * @property {number} hearingRound - Раунд слушаний
 */

/**
 * @typedef {Object} CreateSessionPayload
 * @property {string} committeeId - GUID комиссии
 * @property {string} title - Название заседания
 * @property {string} heldAt - ISO 8601 дата и время
 * @property {string} [location] - Место проведения
 * @property {string} [agenda] - Повестка
 */

/**
 * @typedef {'PendingReview'|'InQueue'|'InFirstHearing'|'Accepted'|'Rejected'} InitiativeStatus
 */

/**
 * @typedef {Object} Initiative
 * @property {string} id - GUID инициативы
 * @property {string} title - Название
 * @property {string} description - Описание
 * @property {string} authorName - ФИО автора
 * @property {string} [committeeId] - GUID комиссии
 * @property {string} [committeeName] - Название комиссии
 * @property {InitiativeStatus} status - Текущий статус
 * @property {string} [imageUrl] - URL изображения
 * @property {string} createdAt - ISO 8601 дата создания
 * @property {string} [approvedAt] - Дата утверждения
 * @property {string} [rejectedAt] - Дата отклонения
 */

/**
 * @typedef {Object} InitiativeDetail
 * @property {string} id - GUID инициативы
 * @property {string} title - Название
 * @property {string} description - Описание
 * @property {string} authorId - GUID автора
 * @property {string} authorName - ФИО автора
 * @property {string} [committeeId] - GUID комиссии
 * @property {string} [committeeName] - Название комиссии
 * @property {InitiativeStatus} status - Статус
 * @property {string} [imageUrl] - URL изображения
 * @property {string} createdAt - Дата создания
 * @property {string} [approvedAt] - Дата утверждения
 * @property {string} [rejectedAt] - Дата отклонения
 * @property {Array<Vote>} [votes] - История голосований
 */

/**
 * @typedef {Object} CreateInitiativePayload
 * @property {string} title - Название
 * @property {string} description - Описание
 * @property {string} [committeeId] - GUID комиссии (опционально)
 */

/**
 * @typedef {Object} ReviewInitiativePayload
 * @property {boolean} isApproved - Одобрить (true) или отклонить (false)
 */

/**
 * @typedef {Object} CreateInitiativeResponse
 * @property {string} id - GUID созданной инициативы
 * @property {string} title - Название
 * @property {string} description - Описание
 * @property {InitiativeStatus} status - Статус
 * @property {string|null} committeeId - GUID комиссии
 * @property {string} committeeName - Название комиссии
 * @property {string} createdAt - Дата создания
 */

/**
 * @typedef {'For'|'Against'|'Abstain'} VoteType
 */

/**
 * @typedef {Object} Vote
 * @property {string} sessionId - GUID заседания
 * @property {string} initiativeId - GUID инициативы
 * @property {string} userId - GUID проголосовавшего
 * @property {VoteType} voteType - Тип голоса
 * @property {string} votedAt - Дата голосования
 */

/**
 * @typedef {Object} CastVotePayload
 * @property {string} sessionId - GUID заседания
 * @property {string} initiativeId - GUID инициативы
 * @property {VoteType} voteType - Тип голоса
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error - Текст ошибки
 * @property {number} statusCode - HTTP статус код
 * @property {string} timestamp - ISO 8601 время возникновения ошибки
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {Array<T>} items - Элементы текущей страницы
 * @property {number} totalCount - Общее количество элементов
 * @property {number} page - Текущая страница
 * @property {number} pageSize - Размер страницы
 * @property {number} totalPages - Общее количество страниц
 */