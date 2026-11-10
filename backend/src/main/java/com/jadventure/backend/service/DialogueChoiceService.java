package com.jadventure.backend.service;

import com.jadventure.backend.repository.DialogueChoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;

@Service
@RequiredArgsConstructor
@Log4j2
public class DialogueChoiceService {

    private final DialogueChoiceRepository choiceRepository;

    @Transactional
    public void detachTargets(Collection<Long> nodeIds) {
        log.info("Executing detachTargets with nodeIds: {}", nodeIds);
        choiceRepository.findByNextNodeIdIn(nodeIds)
                .forEach(choice -> choice.setNextNode(null));
        log.info("Executed detachTargets: choices pointing to nodes {} detached", nodeIds);
    }
}
