using MediatR;
using MyCityCouncil.Application.Features.UsersS.UpdateProfile;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.UsersS.UpdateProfile;

public class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand, UpdateProfileDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfileHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateProfileDto> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, ct)
                   ?? throw new KeyNotFoundException("Пользователь не найден");
        
        if (!string.IsNullOrWhiteSpace(request.HomePhone))
            user.HomePhone = request.HomePhone.Trim();
            
        if (!string.IsNullOrWhiteSpace(request.WorkPhone))
            user.WorkPhone = request.WorkPhone.Trim();

        await _userRepository.UpdateAsync(user, ct);
        await _unitOfWork.SaveAsync(ct);

        return new UpdateProfileDto(
            user.Id,
            $"{user.LastName} {user.MiddleName} {user.FirstName}",
            user.HomePhone,
            user.WorkPhone
        );
    }
}