package com.jadventure.backend.repository;

import com.jadventure.backend.model.DialogueChoice;
import com.jadventure.backend.model.DialogueNode;
import org.springframework.boot.autoconfigure.data.ConditionalOnRepositoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DialogueChoiceRepository extends JpaRepository<DialogueChoice, Long> {

    List<DialogueChoice> findByNextNodeIdIn(Collection<Long> nodeIds);
}
