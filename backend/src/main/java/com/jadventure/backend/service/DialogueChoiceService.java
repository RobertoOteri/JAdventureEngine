package com.jadventure.backend.service;

import com.jadventure.backend.repository.DialogueChoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;

@Service
public class DialogueChoiceService {

    private final DialogueChoiceRepository choiceRepository;

    public DialogueChoiceService (DialogueChoiceRepository choiceRepository) {
       this.choiceRepository = choiceRepository;
    }

    @Transactional
    public void detachTargets(Collection<Long> nodeIds) {
        choiceRepository.findByNextNodeIdIn(nodeIds)
                .forEach(choice -> choice.setNextNode(null));
    }
}
