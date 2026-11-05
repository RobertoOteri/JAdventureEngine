package com.jadventure.backend.service;

import com.jadventure.backend.repository.DialogueChoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;

@Service
@RequiredArgsConstructor
public class DialogueChoiceService {

    private final DialogueChoiceRepository choiceRepository;

    @Transactional
    public void detachTargets(Collection<Long> nodeIds) {
        choiceRepository.findByNextNodeIdIn(nodeIds)
                .forEach(choice -> choice.setNextNode(null));
    }
}
