package com.jadventure.backend.model;

import com.jadventure.backend.model.enums.PreconditionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "preconditions")
public class Precondition {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "precondition_seq_gen")
    @SequenceGenerator(
            name = "precondition_seq_gen",
            sequenceName = "precondition_seq",
            allocationSize = 1
    )
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PreconditionType type;

    @Column(nullable = false)
    private String requiredKey;

    private String expectedValue;

    @Column(name = "failure_message")
    private String failureMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", nullable = false)
    private Action action;

    @Embedded
    private TextBoxDetail textBoxDetail;
}
