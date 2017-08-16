/**
 * Created by totor on 2017-08-13.
 */
// 우선은 0번째 lap을 우선순위로 해서 그리는게 나을듯.
function changeLap(input_lap) {

    // 현재 lap과 input lap이 같을 경우 함수 return
    if (Number(selected_lap) == input_lap.value-1){
        console.log("lap number is same, do nothing");
        return;

    // 다를 경우 다시 그리기.
    }else{
        selected_lap = input_lap.value-1;
        document.getElementById("loading").style.display = "block";
        console.log("lap number is different, change the lap");
        clearAllSVG();
        init(vis_type);

    }

}

function changeRefLap(input_lap) {

    console.log(Number(input_lap.value));

    // 현재 lap과 input lap이 같을 경우 함수 return
    if (Number(selected_ref_lap) == input_lap.value){
        return;

    // 다를 경우 다시 그리기.
    }else{
        selected_ref_lap = input_lap.value-1;
        document.getElementById("loading").style.display = "block";
        console.log("lap number is different, change the lap");
        clearAllSVG();
        init(vis_type);
    }

}