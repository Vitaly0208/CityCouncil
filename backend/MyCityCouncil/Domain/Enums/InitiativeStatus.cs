namespace MyCityCouncil.Domain.Enums;

public enum InitiativeStatus 
{ 
    PendingReview,    // Ждёт админа
    InQueue,          // Пройдена, ждёт заседания
    InFirstHearing,   // На первом слушании
    InSecondHearing,  // На втором слушании
    Accepted,         // Утверждена, в базе действующих
    Rejected          // Отклонена (вместо жёсткого удаления)
}