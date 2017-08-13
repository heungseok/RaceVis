/**
 * Created by totor on 2017-06-11.
 */

// checkbox click listener
function handleCBclick(cb){
    // check박스가 하나라도 클릭되었을 경우 check 되어진 값들 가져온 뒤 chart update
//                console.log(cb.checked);
//                console.log(cb.value);

    var checked_values = []
    $("input[type=checkbox]:checked").each(function () {
        console.log($(this).val())
        checked_values.push($(this).val())
    });
    console.log(checked_values);

    if(checked_values.length == 5){
        // 4개 이상 일때 클릭할 경우 check value 원상태로..
        $("input[value='" + cb.value +"']").prop("checked", false);
        return;
    }

    updateChart(cb.value, cb.checked);
}

