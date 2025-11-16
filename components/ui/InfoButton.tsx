import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import InfoIcon from '../../assets/images/InfoIcon.svg';
import SkyboundText from '../../components/ui/SkyboundText';
import { useColors } from '../../constants/theme';

interface InfoButtonProps  {
    infoText: string
}

const InfoButton: React.FC<InfoButtonProps> = ({ infoText }) => {

    const [isVisible, setIsVisible] = useState(false);
    const colors = useColors();

    return (

         <Tooltip
            isVisible={isVisible}
            content={<SkyboundText variant='primary' accessabilityLabel={infoText}>{infoText}</SkyboundText>}
            placement="top"
            onClose={() => setIsVisible(false)}
            tooltipStyle={{
                backgroundColor: colors.background,
            
            }}

            // the view that directly wraps your `content` prop
            contentStyle={{
                backgroundColor: 'transparent', // make sure the content wrapper doesn't override the bubble
            }}

            // arrow triangle
            arrowStyle={{
                // arrow is drawn on top of tooltipStyle, so match the same color
                backgroundColor: colors.background,
                // On some Android versions the arrow is implemented differently; this usually works.
            }}        
            >
            <TouchableOpacity onPress={() => setIsVisible(true)}>
                <InfoIcon width={24} height={24}/>
            </TouchableOpacity>
        </Tooltip>
    )
}
export default InfoButton