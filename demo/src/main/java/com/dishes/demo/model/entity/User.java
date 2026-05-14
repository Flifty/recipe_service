package com.dishes.demo.model.entity;

import com.dishes.demo.model.enums.RegistrationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    public static final String ID_FIELD = "id";
    public static final String USERNAME_FIELD = "username";
    public static final String EMAIL_FIELD = "email";
    public static final String DELETED_FIELD = "deleted";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String password;

    @Size(max = 150)
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created;

    @Column(nullable = false)
    private LocalDateTime updated;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(nullable = false)
    private Boolean deleted;

    @Column(nullable = false)
    private Boolean active;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false)
    private RegistrationStatus registrationStatus;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Recipe> recipes = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        if (created == null) {
            created = now;
        }
        if (updated == null) {
            updated = now;
        }
        if (deleted == null) {
            deleted = false;
        }
        if (active == null) {
            active = true;
        }
        if (registrationStatus == null) {
            registrationStatus = RegistrationStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updated = LocalDateTime.now();
    }
}