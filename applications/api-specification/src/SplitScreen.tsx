import React, { ReactElement } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
`;

const Pane = styled.div`
    flex: 1;
`;

interface SplitScreenProps {
    leftSide: React.FC;
    rightSide: React.FC;
}



export const SplitScreen: React.FC<SplitScreenProps> = ({ leftSide: LeftSide, rightSide: RightSide }) => {
    return (
        <Wrapper>
            <Pane>
                <LeftSide />
            </Pane>
            <Pane>
                <RightSide />
            </Pane>
        </Wrapper>
    );
};

