package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.LeaderboardService;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class EndAdventureEffectHandler implements EffectHandler {

    private final LeaderboardService leaderboardService;

    public EndAdventureEffectHandler(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @Override
    public EffectType type() {
        return EffectType.END_ADVENTURE;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing END_ADVENTURE effect with adventureId: {}, effect: {}", adventureId, effect);
        state.setCompleted(true);
        leaderboardService.createLeaderboardEntry(adventureId, state.getPlayTime());
        log.info("Executed END_ADVENTURE effect: adventure {} completed with playTime {}", adventureId, state.getPlayTime());
    }
}