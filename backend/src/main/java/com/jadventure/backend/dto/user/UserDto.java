package com.jadventure.backend.dto.user;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    private String bio;
    private Long publishedAdventures;
    private Long completedAdventures;
    private Long reviewsWritten;
}


