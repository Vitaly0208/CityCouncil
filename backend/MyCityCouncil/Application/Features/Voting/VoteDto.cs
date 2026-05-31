namespace MyCityCouncil.Application.Features.Voting;

public record VoteDto(
    Guid Id,
    Guid VoterId,
    string VoterName,
    int VoteType
);